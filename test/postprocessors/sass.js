var should = require('should');
var sass = require('../../lib/postprocessors/sass.js');

describe( 'postprocessor - SASS', function(){

	it( 'converts SASS to CSS', function( cb ){

		var contents = '$blue: #3bbfce;\n'+
			'$margin: 16px;\n'+
			'\n'+
			'.content-navigation {\n'+
			'  border-color: $blue;\n'+
			'  color: darken($blue, 9%);\n'+
			'}\n'+
			'\n'+
			'.border {\n'+
			'  padding: $margin / 2;\n'+
			'  margin: $margin / 2;\n'+
			'  border-color: $blue;\n'+
			'}\n';
		var config = {};

		sass( contents, config, function( processed ){
			processed.should.equal('.content-navigation {\n'+
				'  border-color: #3bbfce;\n'+
				'  color: #2ca2af; }\n'+
				'\n'+
				'.border {\n'+
				'  padding: 8px;\n'+
				'  margin: 8px;\n'+
				'  border-color: #3bbfce; }\n')
			cb();
		});

	});

});