var stylus = require('stylus');

module.exports = function( file, config, callback ){

	if( file.type === 'text/stylus' ){

		stylus.render( file.contents, {
			name: file.name
		}, function( err, css ){

			if( err ){
				throw Error( err );
			}

			callback( css );

		});

	} else {

		callback( file.contents );

	}

};