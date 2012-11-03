var should = require('should');
var sinon = require('sinon');
var Flow = require('../lib/flow.js');

describe('Flow', function(){

	var config = {
		route: 'test.js',
		type: 'js',
		base: 'scripts',
		paths: 'test.js',
		preprocessors: ['coffeescript'],
		postprocessors: ['minify']
	};
	var igneous_config = {
		root: __dirname +'/fixtures',
		store: {
			save: sinon.spy(),
			get: sinon.spy()
		}
	};
	var flow = new Flow( config, igneous_config );

	it( 'sets appropriate MIME types based on type', function(){

		flow.mime_type.should.equal('application/javascript');

	});

	it( 'converts preprocessor strings to methods', function(){

		flow.config.preprocessors[0].should.be.a('function');

	});

	it( 'converts postprocessor strings to methods', function(){

		flow.config.postprocessors[0].should.be.a('function');

	});

	describe( '.flow', function(){

		it( 'regenerates the flow\'s store', function(){

			sinon.spy( flow, 'save' );
			flow.flow();

			flow.save.called.should.be.true;
			flow.save.restore();

		});

	});

	describe( '.add', function(){

		it( 'reads a single file', function(){

			flow.config.paths = ['test.js'];
			flow.add();
			var files_length = 0;
			for( var key in flow.files ) files_length++;

			files_length.should.equal(1);

		});

		it( 'reads a directory of files', function(){

			flow.config.paths = ['test'];
			flow.add();
			var files_length = 0;
			for( var key in flow.files ) files_length++;

			files_length.should.equal(3);

		});

		it( 'excludes files based on extension', function(){

			flow.config.paths = ['test'];
			flow.add();
			var files_length = 0;
			for( var key in flow.files ) files_length++;

			files_length.should.equal(3);

		});

	});

	describe( '.preprocess', function(){

		it( 'runs files through each specified preprocessor', function( cb ){

			var preprocessor = sinon.spy( function( file, config, callback ){
				callback('');
			} );
			flow.config.preprocessors = [preprocessor];
			flow.preprocess( function(){

				preprocessor.called.should.be.true;
				cb();

			});

		});

		it( 'preprocesses serially', function( cb ){

			var preprocessor = function( file, config, callback ){
				callback('');
			};
			var preprocessor1 = sinon.spy( preprocessor );
			var preprocessor2 = sinon.spy( preprocessor );
			var preprocessor3 = sinon.spy( preprocessor );
			flow.config.preprocessors = [ preprocessor1, preprocessor2, preprocessor3 ];
			flow.preprocess( function(){

				preprocessor1.calledBefore(preprocessor2).should.be.true;
				preprocessor2.calledBefore(preprocessor3).should.be.true;
				cb();

			});

		});

	});

	describe( '.concatenate', function(){

		it( 'joins all file data together into a single string', function(){

			flow.files = {
				test: {
					contents: 'test = true;'
				},
				test2: {
					contents: 'test2 = true;'
				}
			};
			var concatenated = flow.files.test.contents +'\r\n'+ flow.files.test2.contents +'\r\n';
			flow.concatenate();

			flow.data.should.equal( concatenated );

		});

	});

	describe( '.postprocess', function(){

		it( 'runs files through each specified postprocessor', function( cb ){

			var postprocessor = sinon.spy( function( file, config, callback ){
				callback('');
			} );
			flow.config.postprocessors = [postprocessor];
			flow.postprocess( function(){

				postprocessor.called.should.be.true;
				cb();

			});

		});

		it( 'postprocesses serially', function( cb ){

			var postprocessor = function( file, config, callback ){
				callback('');
			};
			var postprocessor1 = sinon.spy( postprocessor );
			var postprocessor2 = sinon.spy( postprocessor );
			var postprocessor3 = sinon.spy( postprocessor );
			flow.config.postprocessors = [ postprocessor1, postprocessor2, postprocessor3 ];
			flow.postprocess( function(){

				postprocessor1.calledBefore(postprocessor2).should.be.true;
				postprocessor2.calledBefore(postprocessor3).should.be.true;
				cb();

			});

		});

	});

	describe( '.save', function(){

		it( 'sends file data to be saved by the specified store', function(){

			flow.data = '';
			flow.store.save.reset();
			flow.save();

			flow.store.save.called.should.be.true;

			flow.store.save.reset();

		});

	});

});