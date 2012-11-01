var less = require('less');

module.exports = function( contents, config, callback ){

	less.render( contents, function( err, css ){

		if( err ){
			throw new Error( 'Error when postprocessing LESS: ', err );
		}

		callback( css );

	});

};