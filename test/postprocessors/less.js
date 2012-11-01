var should = require('should');
var less = require('../../lib/postprocessors/less.js');

describe( 'postprocessor - LESS', function(){

	it( 'converts LESS to CSS', function( cb ){

		var contents = '.class { width: (1 + 1) }';
		var config = {};

		less( contents, config, function( processed ){
			processed.should.equal('.class {\n'+
				'  width: 2;\n'+
				'}\n');
			cb();
		});

	});

});