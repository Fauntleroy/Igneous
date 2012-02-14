var should = require('should');
var igneous = require('../lib/igneous');

describe( 'igneous.set()', function(){

	it( 'should set "key" with "value" on config', function(){
		igneous.set( 'test', 'value' );
		igneous._config.test.should.equal( 'value' );
	});
	
});