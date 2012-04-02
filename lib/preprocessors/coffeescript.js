var coffeescript = require('coffee-script');

module.exports = function( flow ){

	flow.strings.forEach( function( string, i ){
		
		var processed = coffeescript.compile( string );
		
		flow.strings[i] = processed;
		
	});

};