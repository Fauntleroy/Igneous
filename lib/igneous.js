var fs = require('fs');
var knox = require('knox');
var events = require('events');
var uglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');

var igneous = new events.EventEmitter();
module.exports = igneous;

igneous.flows = {};
var config = igneous._config = {
	test: false,
	mode: 's3'
};

//
// Set
// Sets configuration options
//

igneous.set = function( key, value ){
	config[key] = value;
};

//
// Flow
// Flow Class
//

igneous.Flow = function( attributes ){
	
	if( typeof attributes === 'undefined' )
		attributes = {};
	
	var flow = this;
	for( var key in attributes )
		flow[key] = attributes[key];
	// TODO report an error if name is not a string with length > 0
	// TODO report an error if type is not a valid type ( css, js, jst )
	// TODO report an error if paths is not an array with a length > 0
	// TODO report an error if paths is not an array of strings
	if( !flow.bucket )
		flow.bucket = config.s3_bucket;
	if( flow.type === 'jst' && !flow.jst_namespace )
		flow.jst_namespace = 'JST';
	if( config.mode === 's3' ){
		if( !config.aws_key )
			throw new Error('aws_key must be set');
		if( !config.aws_secret )
			throw new Error('aws_secret must be set');
		if( !config.s3_bucket )
			throw new Error('s3_bucket must be set');
		// Create knox client
		flow.s3 = knox.createClient({
			key: config.aws_key,
			secret: config.aws_secret,
			bucket: flow.bucket
		});
	}
	else if( config.mode === 'local' ){
		if( !config.local_path )
			throw new Error('local_path must be set');
	}
	
	// Convert folder paths to lists of file paths
	// Add all file paths to files array
	flow.files = [];
	var addFiles = function( paths, root ){
		paths.forEach( function( path, i ){	
			var true_path = ( root.charAt( root.length-1 ) === '/' || root === '' )
				? root + path
				: root +'/'+ path;
			var stats = fs.statSync( true_path );
			if( stats.isDirectory() ){
				var files = fs.readdirSync( true_path );
				addFiles( files, true_path );
			}
			else if( stats.isFile() ){
				flow.files.push( true_path );
			}
			else
				throw new Error('path "'+ true_path +'" is invalid! Must be a file or directory');
		});
	};
	addFiles( flow.paths, '' );
	
	flow.url = '';
	flow._string = '';
	flow._temp = '';
	
	flow._flow = function(){
		
		flow._strings = [];
		flow._string = '';
		
		flow._read();
		flow._preprocess();
		flow._concatenate();
		if( this.compress )
			flow._compress();
		( config.mode === 'local' )
			? flow._write()
			: flow._send();
		
	};
	
	flow._read = function(){
		flow.files.forEach( function( file, i ){
			var contents = fs.readFileSync( file, 'utf-8' );
			flow._strings.push( contents );
		});
	};
	
	flow._preprocess = function(){
		if( flow.type === 'jst' ){
			if( flow.jst_lang === 'handlebars' ){
				var preprocess_handlebars = require('./preprocessors/handlebars.js');
				preprocess_handlebars( flow );
			}
			else if( flow.jst_lang === 'jquery-tmpl' ){
				var preprocess_jquery = require('./preprocessors/jquery-tmpl.js');
				preprocess_jquery( flow );
			}
		}
	};
	
	flow._concatenate = function(){
		console.log( flow._strings );
		flow._string = flow._strings.join('\n');
	};
	
	flow._compress = function(){
		if( flow.type === 'js' || flow.type === 'jst' ){
			var parser = uglifyJS.parser;
			var uglify = uglifyJS.uglify;
			var ast = parser.parse( this._string );
			ast = uglify.ast_mangle( ast );
			ast = uglify.ast_squeeze( ast );
			this._string = uglify.gen_code( ast );
		}
		else if( flow.type === 'css' ){
			var process = cleanCSS.process;
			this._string = process( this._string );
		}
	};
	
	flow._write = function(){
		fs.writeFileSync( config.local_path +'/'+ flow.name, flow._string, 'utf8' );
		flow.url = config.local_path +'/'+ flow.name;
		igneous[flow.name] = flow.url;
	};
	
	flow._send = function(){
		// TODO send the new file directly to S3
		flow._temp = './'+ flow.name;
		fs.writeFileSync( flow._temp, flow._string, 'utf8' );
		flow.s3.putFile( flow._temp, flow.name, flow._receive );
	};
	
	flow._receive = function( err, res ){
		if( err )
			throw new Error( err );
		if( res.statusCode !== 200 )
			throw new Error( 'S3 upload failed' );
		else {
			var generation_time = new Date().getTime();
			fs.unlink( flow._temp );
			flow.url = res.client._httpMessage.url +'?t='+ generation_time;
			igneous[flow.name] = flow.url;
			flow._string = '';
			flow._temp = '';
		}
	};
	
	// update bundle when flow is changed
	flow.files.forEach( function( file, i ){
		fs.watch( file, function( event, filename ){
			// TODO check on different kinds of events, act accordingly
			flow._flow();
		});
	});
	
	if( !config.test )
		flow._flow();
	
};

//
// Create Flows
// Accepts array of flow attributes and creates flow objects
//

igneous.createFlows = function( flows ){
	
	for( var name in flows ){
		var flow = flows[name];
		flow.name = name;
		igneous.flows[name] = new igneous.Flow( flow );
	};
	
};