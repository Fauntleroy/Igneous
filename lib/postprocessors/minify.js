var uglify = require('uglify-js2');
var cleanCSS = require('clean-css');

module.exports = function( contents, config, callback ){

	var minified = '';

	if( config.mime_type === 'application/javascript' ){
		try {
			minified = uglify.minify( contents, {
				fromString: true
			}).code;
		}
		catch( err ){
			console.error( 'Error when minifying JS: ', err );
		}
	}
	else if( config.mime_type === 'text/css' ){
		try {
			minified = cleanCSS.process( contents );
		}
		catch( err ){
			console.error( 'Error when minifying CSS: ', err );
		}
	}

	callback( minified );

};