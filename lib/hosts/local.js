var fs = require('fs');

module.exports = function( config ){

	if( !config.path )
		throw new Error('local_path must be set');
	if( typeof config.path === 'function' )
		config.path = config.path();
	if( typeof config.path !== 'string' )
		throw new Error('\'path\' must be a string or a function that returns a string');

	this.store = function( flow, callback ){
		console.log('STORE THE FILE:', flow.name);
		var time = new Date().getTime();
		var filename = time +'_'+ flow.name;
		
		// delete the old version of this file
		if( flow.path )
			fs.unlinkSync( flow.path );
		
		fs.writeFileSync( config.path +'/'+ filename, flow.string, flow.encoding );
		flow.path = config.path +'/'+ filename;
		flow.url = config.url +'/'+ filename;

		callback( flow );

	};

};