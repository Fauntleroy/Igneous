var vm = require('vm');
var should = require('should');
var coffeescript = require('../../lib/preprocessors/coffeescript.js');

describe( 'preprocessor - coffeescript', function(){

	it( 'converts a coffeescript string into javascript', function(){

		var file = {
			contents: 'this.test = (x) -> x * 2'
		};
		var config = {};
		var compiled = coffeescript( file, config );
		var context = {};
		vm.runInNewContext( compiled, context );

		context.should.have.property('test').with.be.a('function');

	});

});