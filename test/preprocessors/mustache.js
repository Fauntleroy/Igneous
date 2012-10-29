var vm = require('vm');
var should = require('should');
var mustache = require('../../lib/preprocessors/mustache.js');

describe( 'preprocessor - mustache', function(){

	it( 'converts a mustache string into javascript', function(){
		
		var file = {
			path: 'test.jst',
			contents: '<div>{{text}}</div>'
		};
		var config = {
			jst_namespace: 'JST'
		};
		var compiled = mustache( file, config );
		var context = {};
		vm.runInNewContext( compiled, context );

		context.should.have.property('JST').with.have.property('test');

	});

});