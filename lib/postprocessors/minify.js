var uglify = require('uglify-js2');
var cleanCSS = require('clean-css');

module.exports = function( contents, config ){

	var minified = '';

	if( config.mime_type === 'text/javascript' ){
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

	return minified;

};