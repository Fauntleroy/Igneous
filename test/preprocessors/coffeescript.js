var vm = require('vm');
var should = require('should');
var coffeescript = require('../../lib/preprocessors/coffeescript.js');

describe( 'preprocessor - coffeescript', function(){

	it( 'converts a coffeescript string into javascript', function( cb ){

		var file = {
			contents: 'this.test = (x) -> x * 2',
			type: 'application/coffeescript'
		};
		var config = {};
		
		coffeescript( file, config, function( processed ){

			var context = {};
			vm.runInNewContext( processed, context );

			context.should.have.property('test').with.be.a('function');
			cb();

		});

	});

});