var vm = require('vm');
var should = require('should');
var handlebars = require('../../lib/preprocessors/handlebars.js');

describe( 'preprocessor - handlebars', function(){

	it( 'converts a handlebars string into javascript', function( cb ){
		
		var file = {
			path: 'test.jst',
			contents: '<div>{{text}}</div>'
		};
		var config = {
			jst_namespace: 'JST'
		};
		handlebars( file, config, function( processed ){

			var context = {};
			vm.runInNewContext( processed, context );

			context.should.have.property('JST').with.have.property('test');
			cb();

		});

	});

});