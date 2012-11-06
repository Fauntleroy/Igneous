var less = require('less');

module.exports = function( file, config, callback ){

	if( file.type === 'text/less' ){

		less.render( file.contents, function( err, css ){

			if( err ){
				throw Error( err );
			}

			callback( css );

		});

	} else {

		callback( file.contents );

	}

};