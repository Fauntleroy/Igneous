var vm = require('vm');
var should = require('should');
var jquery_tmpl = require('../../lib/preprocessors/jquery-tmpl.js');

describe( 'preprocessor - jquery-tmpl', function(){

	it( 'converts a jquery template string into javascript', function( cb ){
		
		var file = {
			path: 'test.jst',
			contents: '<div>{{text}}</div>'
		};
		var config = {
			jst_namespace: 'JST'
		};
		jquery_tmpl( file, config, function( processed ){

			var context = {};
			vm.runInNewContext( processed, context );

			context.should.have.property('JST').with.have.property('test');
			cb();

		});

	});

});