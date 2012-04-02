var fs = require('fs');
var knox = require('knox');
var events = require('events');
var uglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');

var _isArray = function( object ){
	return ( Object.prototype.toString.call( object ) === '[object Array]' )
		? true
		: false;
};

var igneous = new events.EventEmitter();
module.exports = igneous;

var flows = igneous.flows = {};
var config = {
	test: false,
	compress: false,
	base_path: '',
	encoding: 'utf8'
};

//
// Flow
// Flow Class
//

igneous.Flow = function( attributes ){
	
	if( typeof attributes === 'undefined' )
		var attributes = {};
	
	var flow = this;
	var s3;
	var tmp;
	
	flow.name =				attributes.name;
	flow.type =				attributes.type;
	flow.base_path =		attributes.base_path || config.base_path;
	flow.paths =			attributes.paths;
	flow.files =			[];
	flow.compress =			attributes.compress || config.compress;
	flow.jst_lang =			attributes.jst_lang;
	flow.jst_namespace =	attributes.jst_namespace;
	flow.encoding =			attributes.encoding || config.encoding;
	flow.strings =			[];
	flow.string =			'';
	flow.url =				'';
	
	// Validate flow name
	if( typeof flow.name === 'function' )
		flow.name = flow.name();
	if( typeof flow.name !== 'string' )
		throw new Error('\'name\' must be a string or a function that returns a string');
	if( flow.name.length < 1 )
		throw new Error('\'name\' cannot be empty');
	
	// Validate flow type
	if( typeof flow.type === 'function' )
		flow.type = flow.type();
	if( typeof flow.type !== 'string' )
		throw new Error('\'type\' must be a string or a function that returns a string');
	if( flow.type !== 'css' && flow.type !== 'js' && flow.type !== 'jst' )
		throw new Error('\'type\' must be \'css\', \'js\', or \'jst\'');
	
	// Validate paths
	if( typeof flow.paths === 'string' )
		flow.paths = [flow.paths];
	if( !_isArray(flow.paths) )
		throw new Error('\'paths\' must be a string or array of strings');
	if( flow.paths.length < 1 )
		throw new Error('\'paths\' must contain relative paths as strings');
	flow.paths.forEach( function( path, i ){
		if( typeof path === 'function' )
			path = path();
	});
	
	// Validate host
	if( !config.host )
		throw new Error('\'host\' must be set');
	
	// Validate host (s3)
	if( config.host.provider === 's3' ){
		if( !config.aws_key )
			throw new Error('\'aws_key\' must be set');
		if( !config.aws_secret )
			throw new Error('\'aws_secret\' must be set');
		if( !config.s3_bucket )
			throw new Error('\'bucket\' must be set');
		// Create knox client
		s3 = knox.createClient({
			key: config.host.aws_key,
			secret: config.host.aws_secret,
			bucket: config.host.bucket
		});
	}
	// Validate host (local)
	else if( config.host.provider === 'local' ){
		if( !config.host.path )
			throw new Error('local_path must be set');
		if( typeof config.host.path === 'function' )
			config.host.path = config.host.path();
		if( typeof config.host.path !== 'string' )
			throw new Error('\'path\' must be a string or a function that returns a string');
	}
	
	// jst_namespace default
	if( flow.type === 'jst' && !flow.jst_namespace )
		flow.jst_namespace = 'JST';
	
	// Convert folder paths to lists of file paths
	// Add all file paths to files array
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
			else if( stats.isFile() )
				flow.files.push( true_path );
			else
				throw new Error('path "'+ true_path +'" is invalid! Must be a file or directory');
		});
	};
	addFiles( flow.paths, flow.base_path );
	
	// _flow()
	// Generates a flow, can be run manually to regenerate a flow
	flow._flow = function(){
		
		flow._read();
		flow._preprocess();
		flow._concatenate();
		if( flow.compress )
			flow._compress();
		( config.host.provider === 'local' )
			? flow._write()
			: flow._send();
		
	};
	
	// _read()
	// Reads each file in a flow and adds its contents to the strings array
	flow._read = function(){
	
		flow.files.forEach( function( file, i ){
			var contents = fs.readFileSync( file, 'utf-8' );
			flow.strings.push( contents );
		});
		
	};
	
	// _preprocess()
	// Runs files through preprocessors and updates processed contents
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
	
	// _concatenate()
	// Joins file strings	
	flow._concatenate = function(){
		
		flow.string = flow.strings.join('\n');
		flow.strings = [];
		
	};
	
	// _compress()
	// Compresses file string
	flow._compress = function(){
		
		if( flow.type === 'js' || flow.type === 'jst' ){
			var parser = uglifyJS.parser;
			var uglify = uglifyJS.uglify;
			var ast = parser.parse( flow.string );
			ast = uglify.ast_mangle( ast );
			ast = uglify.ast_squeeze( ast );
			flow.string = uglify.gen_code( ast );
		}
		else if( flow.type === 'css' ){
			var process = cleanCSS.process;
			flow.string = process( flow.string );
		}
		
	};
	
	// _write()
	// Writes file to disk
	flow._write = function(){
		
		fs.writeFileSync( config.host.path +'/'+ flow.name, flow.string, flow.encoding );
		flow.url = config.host.url +'/'+ flow.name;
		
	};
	
	// _send()
	// Sends file to third-party
	flow._send = function(){
		
		// TODO send the new file directly to S3
		tmp = './'+ flow.name;
		fs.writeFileSync( tmp, flow.string, flow.encoding );
		s3.putFile( tmp, flow.name, flow._receive );
		
	};
	
	// _receive()
	// Accepts third-party response
	flow._receive = function( err, res ){
		
		if( err )
			throw new Error( err );
		if( res.statusCode !== 200 )
			throw new Error( 'S3 upload failed' );
		else {
			var generation_time = new Date().getTime();
			fs.unlink( tmp );
			flow.url = res.client._httpMessage.url +'?t='+ generation_time;
			igneous[flow.name] = flow.url;
			flow.string = '';
			tmp = '';
		}
		
	};
	
	// tag()
	// Shortcut for igneous.tag()
	flow.tag = igneous.tag( flow );
	
	// update bundle when flow is changed
	flow.files.forEach( function( file, i ){
		fs.watch( file, function( event, filename ){
			// TODO check on different kinds of events, act accordingly
			console.log( 'EVENT: '+ event );
			if( event === 'change' )
				flow._flow();
		});
	});
	
	if( !config.test )
		flow._flow();
	
};

//
// createFlows( flows )
// Accepts array of flow attributes and creates flow objects
//

igneous.createFlows = function( flows ){
	
	var this_flows = [];
	
	flows.forEach( function( flow, i ){
		var flow = flows[i];
		igneous.flows[flow.name] = new igneous.Flow( flow );
		this_flows.push( igneous.flows[flow.name] );
	});
	
	return this_flows;
	
};

//
// config()
// Accepts object of config options, mixes into defaults
//

igneous.config = function( options ){
	
	for( var key in options )
		config[key] = options[key];
	
};

//
// tag()
// Returns the appropriate HTML tag for the flow
//

igneous.tag = function( flow_name ){
	
	var flow = igneous.flows[flow_name];
	var tag = '';
	
	if( flow ){
		if( flow.type === 'css' )
			tag = '<link rel="stylesheet" type="text/css" href="'+ flow.url +'" />';
		else if( flow.type === 'js' || flow.type === 'jst' )
			tag = '<script type="text/javascript" src="'+ flow.url +'"></script>';
	}
	
	return tag;
	
};