var fs = require('fs');
var knox = require('knox');
var events = require('events');
var uglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');

var igneous = new events.EventEmitter();
module.exports = igneous;

igneous.flows = {};
var config = igneous._config = {
	test: false
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
	// TODO report an error if name is not a string with length > 0
	flow.name = attributes.name;
	// TODO report an error if type is not a valid type ( css, js )
	flow.type = attributes.type;
	flow.compress = attributes.compress || false;
	// TODO report an error if files is not an array with a length > 0
	// TODO report an error if files is not an array of strings
	flow.files = attributes.files;
	flow.bucket = attributes.bucket || config.s3_bucket;
	if( !config.aws_key )
		throw new Error('aws_key must be set');
	if( !config.aws_secret )
		throw new Error('aws_secret must be set');
	if( !config.s3_bucket )
		throw new Error('s3_bucket must be set');
	flow.s3 = knox.createClient({
		key: config.aws_key,
		secret: config.aws_secret,
		bucket: flow.bucket
	});
	flow.url = '';
	flow._string = '';
	flow._temp = '';
	
	flow._flow = function(){
		flow._string = '';
		flow._concatenate();
		if( this.compress )
			flow._compress();
		flow._send();
	};
	
	flow._concatenate = function(){
		flow.files.forEach( function( file, i ){
			var contents = fs.readFileSync( file, 'utf-8' );
			flow._string += contents +'\n';
		});
	};
	
	flow._compress = function(){
		if( flow.type === 'js' ){
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
	
	flow._send = function(){
		// TODO send the new file directly to S3
		flow._temp = './'+ flow.name;
		fs.writeFileSync( flow._temp, flow._string, 'utf8' );
		flow.s3.putFile( flow._temp, flow.name, flow._receive );
	};
	
	flow._receive = function( err, res ){
		if( err )
			console.error( err );
		if( res.statusCode !== 200 )
			console.error( 's3 upload failed' );
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