var vm = require('vm');
var should = require('should');
var handlebars = require('../../lib/preprocessors/handlebars.js');

describe( 'preprocessor - handlebars', function(){

	it( 'converts a handlebars string into javascript', function(){
		
		var file = {
			path: 'test.jst',
			contents: '<div>{{text}}</div>'
		};
		var config = {
			jst_namespace: 'JST'
		};
		var compiled = handlebars( file, config );
		var context = {};
		vm.runInNewContext( compiled, context );

		context.should.have.property('JST').with.have.property('test');

	});

});