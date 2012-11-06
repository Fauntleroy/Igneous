var sass = require('node-sass');

module.exports = function( file, config, callback ){

	if( file.type === 'text/sass' ){

		sass.render( file.contents, function( err, css ){

			if( err ){
				throw Error( err );
			}

			callback( css );

		});

	} else {

		callback( file.contents );

	}

};