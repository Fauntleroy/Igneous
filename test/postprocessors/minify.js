var should = require('should');
var minify = require('../../lib/postprocessors/minify.js');

describe( 'postprocessor - minify', function(){

	it( 'minifies javascript', function(){

		var contents = 'var test = true;'+
			'if( test ) console.log( true );';
		var config = {
			mime_type: 'text/javascript'
		};
		var minified = minify( contents, config );

		minified.length.should.be.below( contents.length );

	});

	it( 'minifies css', function(){

		var contents = '#test {'+
			'border-color: #ff0000;'+
			'border-width: 5px;'+
			'border-style: solid'+
			'}';
		var config = {
			mime_type: 'text/css'
		};
		var minified = minify( contents, config );

		minified.length.should.be.below( contents.length );

	});

});