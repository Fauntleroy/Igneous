var fs = require('fs');
var path = require('path');
var util = require('util');
var async = require('async');
var chokidar = require('chokidar');
var uglify = require('uglify-js2');
var cleanCSS = require('clean-css');
var preprocessors = require('./preprocessors');

// Translate extensions to MIME types
var MIME_TYPES = {
	css: 'text/css',
	js: 'text/javascript',
	jst: 'text/javascript'
};

var current_id = 0;

// Preprocess all file types with preprocessors available
var preprocess = function( path, data, flow ){

	if( flow.type === 'jst' ){
		var preprocessor = preprocessors[flow.config.jst_lang];
		if( preprocessor ){
			data = preprocessor( path, data, flow );
		}
		else {
			throw new Error('"'+ preprocessors[flow.config.jst_lang] +'" preprocessor not found.');
		}
	}

	return data;

};

var Flow = function( config, igneous_config ){

	var flow = this;
	flow.config = config = config || {};
	var first = {}; // hack to ignore first watch event
	var tmp;

	config.minify = ( typeof config.minify !== 'undefined' )? config.minify: igneous_config.minify;
	config.watch = ( typeof config.watch !== 'undefined' )? config.watch: igneous_config.watch;
	config.encoding = config.encoding || igneous_config.encoding;
	config.base = path.join( igneous_config.root, config.base );

	flow.id = current_id++;
	flow.route = config.route;
	flow.files = {};
	flow.headers = {};
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
	flow.mime_type = MIME_TYPES[config.type];
	if( typeof flow.mime_type === 'undefined' ){
		throw new Error('invalid \'type\': '+ config.type );
	}
	
	// Set valid extensions for this flow
	config.extensions = config.extensions || [config.type];
	
	// Validate paths
	if( typeof config.paths === 'string' ){
		config.paths = [config.paths];
	}
	if( !util.isArray(config.paths) ){
		throw new Error('\'paths\' must be a string or array of strings');
	}

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

		var start_flow = new Date().getTime();
		flow.modified = new Date();

		flow.add( function(){

			var end_add = new Date().getTime();
			if( igneous_config.debug ){
				console.log('Igneous: Flow addition completed in '+ ( end_add - start_flow ) +'ms');
			}
			if( config.minify ){
				flow.minify();
			}

			igneous_config.store.save({
				data: new Buffer( flow.data, flow.encoding ),
				id: flow.id
			}, function(){
				
				flow.data = null;
				var end_flow = new Date().getTime();
				if( igneous_config.debug ){
					console.log('Igneous: Flow generation completed in '+ ( end_flow - start_flow ) +'ms');
				}

			});
		});

	};

	// TODO Organize this method in a reasonable way
	// Add specific files to flow
	flow.add = function( add_cb ){
		
		flow.files = {};
		flow.data = '';
		
		// Convert folder paths to lists of file paths
		// Add all file paths to files array
		var addFiles = function( paths, root, addFiles_cb ){
			
			var handlePath = function( file_path, callback ){

				var handleExistence = function( exists ){

					if( !exists ){

						console.error('WARNING: '+ full_path +' does not exist!');
						callback();

					} else {

						fs.stat( full_path, handleStats );

					}

				};

				var handleStats = function( err, stats ){

					if( stats.isDirectory() ){

						fs.readdir( full_path, handleDirectory );

					} else if( stats.isFile() ){

						var extension = path.extname( full_path ).substr(1);
						var is_extension_relevant = !config.extensions.indexOf( extension );
						var is_added = ( typeof flow.files[full_path] !== 'undefined' );

						if( is_extension_relevant && !is_added ){
				
							fs.readFile( full_path, config.encoding, handleFile );

						} else {
							callback();
						}

					} else {
						callback();
					}

				};

				var handleDirectory = function( err, files ){

					addFiles( files, full_path, callback );

				};

				var handleFile = function( err, contents ){

					// Remove BOM (Byte Mark Order)
					if( contents.charCodeAt(0) === 65279 ){
						contents = contents.substring(1);
					}
					contents = preprocess( file_path, contents, flow );
					flow.files[full_path] = contents;
					flow.data += contents +'\r\n';
					callback();

				};

				var full_path = path.join( root, file_path );
				fs.exists( full_path, handleExistence );

			};

			async.forEach( paths, handlePath, addFiles_cb );

		};
		
		addFiles( config.paths, config.base, add_cb );
		
	};

	// Minify file string
	flow.minify = function(){

		if( config.type === 'js' || config.type === 'jst' ){
			try {
				var minified = uglify.minify( flow.data, {
					fromString: true
				});
				flow.data = minified.code;
			}
			catch( err ){
				console.error( 'Error when minifying JS: ', err );
			}
		}
		else if( config.type === 'css' ){
			try {
				var process = cleanCSS.process;
				flow.data = process( flow.data );
			}
			catch( err ){
				console.error( 'Error when minifying CSS: ', err );
			}
		}

	};

	// Watchespecified paths for changes and regenerates the flow
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