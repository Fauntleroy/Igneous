var coffeescript = require('coffee-script');

module.exports = function( file, config, callback ){
	
	var processed = coffeescript.compile( file.contents );
	
	callback( processed );

};