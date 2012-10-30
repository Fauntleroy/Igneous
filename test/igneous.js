var should = require('should');
var sinon = require('sinon');
var igneous = require('../lib/igneous.js');
var Flow = require('../lib/flow.js');

var config = {
	root: __dirname +'/fixtures/scripts',
	flows: [{
		route: 'test.js',
		type: 'js',
		paths: 'test.js'
	}]
};
igneous( config );

describe( 'igneous', function(){

	it( 'creates a Flow for each flow config', function(){

		var flows = igneous.flows;

		flows.length.should.equal(1);
		flows[0].should.be.instanceOf(Flow);

	});

	describe( 'middleware', function(){

		it( 'intercepts requests that match flow routes', function(){
			
			var next = sinon.spy();
			var request = {
				url: '/test.js',
				headers: {}
			};
			var response = {
				writeHead: sinon.spy(),
				end: sinon.spy()
			};

			igneous.middleware( request, response, next );

			response.writeHead.called.should.be.true;
			response.end.called.should.be.true;
			next.called.should.be.false;

		});

		it( 'does not intercept requests that do not match flow routes', function(){

			var next = sinon.spy();
			var request = {
				url: '/ninny-ninny-chittybang.js',
				headers: {}
			};
			var response = {
				writeHead: sinon.spy(),
				end: sinon.spy()
			};

			igneous.middleware( request, response, next );

			response.writeHead.called.should.be.false;
			response.end.called.should.be.false;
			next.called.should.be.true;

		});

		it( 'returns 304 if client already has up to date file', function(){

			var next = sinon.spy();
			var request = {
				url: '/test.js',
				headers: {
					'if-modified-since': new Date( Date.now() )
				}
			};
			var response = {
				writeHead: sinon.spy(),
				end: sinon.spy()
			};

			igneous.middleware( request, response, next );

			response.writeHead.calledWith( 304 ).should.be.true;
			response.end.called.should.be.true;
			next.called.should.be.false;

		});

	});

});