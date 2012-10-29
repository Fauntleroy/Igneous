var vm = require('vm');
var should = require('should');
var jquery_tmpl = require('../../lib/preprocessors/jquery-tmpl.js');

describe( 'preprocessor - jquery-tmpl', function(){

	it( 'converts a jquery template string into javascript', function(){
		
		var file = {
			path: 'test.jst',
			contents: '<div>{{text}}</div>'
		};
		var config = {
			jst_namespace: 'JST'
		};
		var compiled = jquery_tmpl( file, config );
		var context = {};
		vm.runInNewContext( compiled, context );

		context.should.have.property('JST').with.have.property('test');

	});

});