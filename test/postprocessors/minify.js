var should = require('should');
var minify = require('../../lib/postprocessors/minify.js');

describe( 'postprocessor - minify', function(){

	it( 'minifies javascript', function( cb ){

		var contents = 'var test = true;'+
			'if( test ) console.log( true );';
		var config = {
			mime_type: 'text/javascript'
		};
		minify( contents, config, function( minified ){
			minified.length.should.be.below( contents.length );
			cb();
		});

	});

	it( 'minifies css', function( cb ){

		var contents = '#test {'+
			'border-color: #ff0000;'+
			'border-width: 5px;'+
			'border-style: solid'+
			'}';
		var config = {
			mime_type: 'text/css'
		};
		minify( contents, config, function( minified ){
			minified.length.should.be.below( contents.length );
			cb();
		});

	});

});