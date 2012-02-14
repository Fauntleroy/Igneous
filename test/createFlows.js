var should = require('should');
var sinon = require('sinon');
var igneous = require('../lib/igneous');

describe( 'igneous.createFlows()', function(){

	it( 'should call igneous.Flow() for each item passed to igneous.createFlows()', function(){
		var stub = sinon.stub( igneous, 'Flow' );
		igneous.createFlows({
			'stylesheets.css': {
				type: 'css',
				files: [
					'styles/layout.css',
					'styles/red.css'
				],
				compress: true
			}
		});
		stub.called.should.equal.true;
		stub.restore();
	});

});