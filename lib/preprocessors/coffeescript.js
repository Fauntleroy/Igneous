var coffeescript = require('coffee-script');

module.exports = function( path, contents, flow ){
		
	var processed = coffeescript.compile( contents );
	
	return processed;

};