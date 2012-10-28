var coffeescript = require('coffee-script');

module.exports = function( file, config ){
	
	var processed = coffeescript.compile( file.contents );
	
	return processed;

};