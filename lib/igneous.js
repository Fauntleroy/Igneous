var fs = require('fs');
var knox = require('knox');
var events = require('events');
igneous = new events.EventEmitter();
module.exports = igneous;

igneous.flows = [];
igneous._config = {};
igneous._s3 = false;

igneous._configS3 = function(){
	
	// TODO report an error if s3 config is insufficient
	igneous._s3 = knox.createClient({
		key: igneous._config.s3_key,
		secret: igneous._config.s3_secret,
		bucket: igneous._config.s3_bucket
	});
	
};

igneous.set = function( key, value ){
	igneous._config[key] = value;
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
	this.name = attributes.name;
	// TODO report an error if type is not a valid type ( css, js )
	this.type = attributes.type;
	this.minify = attributes.minify || false;
	// TODO report an error if files is not an array with a length > 0
	// TODO report an error if files is not an array of strings
	this.files = attributes.files;
	this.url = '';
	this._string = '';
	this._temp = '';
	
	this._flow = function(){
		this._string = '';
		this._concatenate();
		this._compress();
		this._send();
	};
	
	this._concatenate = function(){
		this.files.forEach( function( file, i ){
			var contents = fs.readFileSync( file, 'utf-8' );
			flow._string += contents +'\n';
		});
		return flow._string;
	};
	
	this._compress = function(){
		
	};
	
	this._send = function(){
		// TODO send the new file directly to S3
		this._temp = './'+ this.name;
		var stream = fs.writeFile( this._temp, this._string, 'utf8', function( err ){
			if( err )
				console.error( err );
		});
		igneous._s3.putFile( this._temp, 'test.css', this._receive );
	};
	
	this._receive = function( err, res ){
		if( err )
			console.error( err );
		if( res.statusCode !== 200 )
			console.error( 's3 upload failed' );
		else {
			fs.unlink( flow._temp );
			flow._string = '';
			flow._temp = '';
			flow.url = res.client._httpMessage.url;
		}
	};
	
	this._flow();
	
	// update bundle when flow is changed
	this.files.forEach( function( file, i ){
		fs.watch( file, function( event, filename ){
			// TODO check on different kinds of events, act accordingly
			flow._flow();
		});
	});
	
};

//
// Create Flows
// Accepts array of flow attributes and creates flow objects
//

igneous.createFlows = function( flows ){
	
	if( !igneous.s3 )
		igneous._configS3();
	
	for( filename in flows ){
		var flow = flows[filename];
		flow.name = filename;
		igneous.flows[filename] = new igneous.Flow( flow );
	};
	
};