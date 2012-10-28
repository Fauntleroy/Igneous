var fs = require('fs');
var path = require('path');
var util = require('util');
var async = require('async');
var chokidar = require('chokidar');
var preprocessors = require('./preprocessors');
var postprocessors = require('./postprocessors');

// Translate extensions to MIME types
var MIME_TYPES = {
	css: 'text/css',
	js: 'text/javascript',
	jst: 'text/javascript',
	coffee: 'text/javascript'
};

var current_id = 0;

var Flow = function( config, igneous_config ){

	var flow = this;
	flow.config = config = config || {};
	var first = {}; // hack to ignore first watch event

	config.minify = ( typeof config.minify !== 'undefined' )? config.minify: igneous_config.minify;
	config.watch = ( typeof config.watch !== 'undefined' )? config.watch: igneous_config.watch;
	config.encoding = config.encoding || igneous_config.encoding;
	config.base = path.join( igneous_config.root, config.base );
	config.preprocessors = config.preprocessors || [];
	config.postprocessors = config.postprocessors || [];
	config.extensions = config.extensions || [config.type];

	flow.id = current_id++;
	flow.route = config.route;
	flow.files = {};
	flow.data = null;
	flow.url = null;
	flow.modified = null;

	// Validate flow name
	if( typeof flow.route !== 'string' && !util.isRegExp( flow.route ) ){
		throw new Error('\'route\' must be a string or regex');
	}

	// Validate flow type
	if( typeof config.type !== 'string' ){
		throw new Error('\'type\' must be a string');
	}
	flow.type = config.type;
	flow.mime_type = config.mime_type = MIME_TYPES[config.type];
	if( typeof flow.mime_type === 'undefined' ){
		throw new Error('invalid type: "'+ config.type +'"' );
	}
	
	// Validate paths
	if( typeof config.paths === 'string' ){
		config.paths = [config.paths];
	}
	if( !util.isArray(config.paths) ){
		throw new Error('\'paths\' must be a string or array of strings');
	}

	// Configure preprocessors
	if( flow.type === 'jst' ){
		config.preprocessors.unshift( config.jst_lang );
	} else if( flow.type === 'coffee' ){
		config.preprocessors.unshift('coffeescript');
	}
	config.preprocessors = config.preprocessors.map( function( preprocessor ){
		if( typeof preprocessor === 'string' ){
			if( !preprocessors[preprocessor] ){
				throw new Error('Invalid preprocessor "'+ preprocessor +'".');
			}
			return preprocessors[preprocessor];
		} else if( typeof preprocessor !== 'function' ){
			throw new Error('Invalid preproccessor "'+ preprocessor +'". Preprocessors must be the name of a built-in preprocessor, or a preprocessing function.');
		}
	});

	// Configure postprocessors
	if( config.minify ){
		config.postprocessors.push('minify');
	}
	config.postprocessors = config.postprocessors.map( function( postprocessor ){
		if( typeof postprocessor === 'string' ){
			if( !postprocessors[postprocessor] ){
				throw new Error('Invalid postprocessor "'+ postprocessor +'".');
			}
			return postprocessors[postprocessor];
		} else if( typeof postprocessor !== 'function' ){
			throw new Error('Invalid postproccessor "'+ postprocessor +'". Postprocessors must be the name of a built-in postprocessor, or a postprocessing function.');
		}
	});

	// jst_namespace default
	if( config.type === 'jst' && !config.jst_namespace ){
		config.jst_namespace = 'JST';
	}

	// Handle special watch reflow events
	var watch_flow = function( event, path ){

		if( first[path] ){
			flow.flow();
		} else {
			first[path] = true;
		}

	};

	// Generate a flow, can be run manually to regenerate a flow
	flow.flow = function(){

		flow.modified = new Date();

		flow.add();
		flow.preprocess();
		flow.concatenate();
		flow.postprocess();
		flow.save();

	};

	// TODO Organize this method in a reasonable way
	// Add specific files to flow
	flow.add = function(){
		
		flow.files = {};
		flow.data = '';
		
		// Loop through paths adding all files found to the files object
		var addFiles = function( paths, root ){

			paths.forEach( function( file_path ){	

				var full_path = path.join( root, file_path );
				var exists = fs.existsSync( full_path );

				if( !exists ){
					return console.error('WARNING: '+ full_path +' does not exist!', __dirname, root, full_path);
				}

				var stats = fs.statSync( full_path );

				if( stats.isDirectory() ){

					var files = fs.readdirSync( full_path );
					addFiles( files, full_path );

				} else if( stats.isFile() ){

					var extension = path.extname( full_path ).substr(1);
					var is_extension_relevant = ( config.extensions.indexOf( extension ) !== -1 );
					var is_added = ( typeof flow.files[full_path] !== 'undefined' );

					if( is_extension_relevant && !is_added ){

						var contents = fs.readFileSync( full_path, config.encoding );
						// Remove BOM (Byte Mark Order)
						if( contents.charCodeAt(0) === 65279 ){
							contents = contents.substring(1);
						}
						flow.files[full_path] = {
							path: file_path,
							contents: contents
						};

					}

				} else {
					throw new Error('path "'+ full_path +'" is invalid! Must be a file or directory');
				}

			});

		};
		
		addFiles( config.paths, config.base );
		
	};

	// Run files through preprocessors
	flow.preprocess = function(){

		for( var key in flow.files ){
			var file = flow.files[key];
			config.preprocessors.forEach( function( preprocessor ){
				file.contents = preprocessor( file, flow.config );
			});
		}

	};

	// Stitch all the file strings together
	flow.concatenate = function(){

		for( var key in flow.files ){
			var file = flow.files[key];
			flow.data += file.contents +'\r\n';
		}
		flow.files = {};

	};

	// Minify file string
	flow.postprocess = function(){

		config.postprocessors.forEach( function( postprocessor ){

			flow.data = postprocessor( flow.data, flow.config );

		});

	};

	// Save the file data to the store configured
	flow.save = function(){

		igneous_config.store.save({
			data: new Buffer( flow.data, flow.encoding ),
			id: flow.id
		}, function(){
			
			flow.data = null;

		});

	};

	// Watch specified paths for changes and regenerates the flow
	flow.watch = function(){

		var file_paths = config.paths.map( function( file_path ){

			file_path = path.join( config.base, file_path );
			var exists = fs.existsSync( file_path );

			if( exists ){
				var stats = fs.statSync( file_path );
				var is_file = stats.isFile();
				var is_directory = stats.isDirectory();
				
				if( !is_file && !is_directory ){
					throw new Error('path "'+ file_path +'" is invalid! Must be a file or directory');
				} else {
					return file_path;
				}
			}
			else {
				console.log('WARNING: '+ file_path +' does not exist!');
			}

		});

		var watcher = chokidar.watch( file_paths, {
			persistent: true
		});
		watcher.on( 'all', watch_flow );

	};

	if( flow.watch ){
		flow.watch();
	}

	// Compile the flow the first time
	flow.flow();

};

module.exports = Flow;