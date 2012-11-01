var vm = require('vm');
var should = require('should');
var mustache = require('../../lib/preprocessors/mustache.js');

describe( 'preprocessor - mustache', function(){

	it( 'converts a mustache string into javascript', function( cb ){
		
		var file = {
			path: 'test.jst',
			contents: '<div>{{text}}</div>'
		};
		var config = {
			jst_namespace: 'JST'
		};
		mustache( file, config, function( processed ){

			var context = {};
			vm.runInNewContext( processed, context );

			context.should.have.property('JST').with.have.property('test');
			cb();

		});

	});

});