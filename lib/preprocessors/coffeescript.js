var coffeescript = require('coffee-script');

module.exports = function( file, config, callback ){

	var processed = ( file.type === 'application/coffeescript' )? coffeescript.compile( file.contents ): file.contents;
	
	callback( processed );

};