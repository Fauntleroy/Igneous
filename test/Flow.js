var should = require('should');
var sinon = require('sinon');
var fs = require('fs');
var igneous = require('../lib/igneous.js');
igneous.set( 'test', true );

describe( 'igneous.Flow()', function(){
	
	it( 'requires aws_key to be set', function(){
		try {
			var test_flow = new igneous.Flow();
		}
		catch( err ){
			err.message.should.equal('aws_key must be set');
		}
	});
	
	it( 'requires aws_secret to be set', function(){
		try {
			igneous.set( 'aws_key', 'test' );
			var test_flow = new igneous.Flow();
		}
		catch( err ){
			err.message.should.equal('aws_secret must be set');
		}
	});
	
	it( 'requires s3_bucket to be set', function(){
		try {
			igneous.set( 'aws_key', 'test' );
			igneous.set( 'aws_secret', 'test' );
			var test_flow = new igneous.Flow();
		}
		catch( err ){
			err.message.should.equal('s3_bucket must be set');
		}
	});
	
	it( 'concatenates the contents of files in the files array', function(){
		igneous.set( 's3_bucket', 'test' );
		var flow = new igneous.Flow({
			name: 'test.css',
			type: 'css',
			files: [
				'test/styles/test1.css',
				'test/styles/test2.css'
			],
			compress: false
		});
		flow._concatenate();
		var concat_files = 'body { background: #fff; }\nbody { color: #000; }\n';
		flow._string.should.equal( concat_files );
	});
	
	it( 'compresses javascript', function(){
		var flow = new igneous.Flow({
			name: 'test.js',
			type: 'js',
			files: [
				'test/scripts/test1.js',
				'test/scripts/test2.js'
			],
			compress: true
		});
		flow._concatenate();
		flow._compress();
		var compress_files = 'var test=1,test2=2';
		flow._string.should.equal( compress_files );
	});
	
	it( 'does not compress javascript when told not to', function(){
		var flow = new igneous.Flow({
			name: 'test.js',
			type: 'js',
			files: [
				'test/scripts/test1.js',
				'test/scripts/test2.js'
			],
			compress: false
		});
		var stub = sinon.stub( flow, '_send' );
		flow._flow();
		var concat_files = 'var test = 1;\nvar test2 = 2;\n';
		flow._string.should.equal( concat_files );
	});
	
	it( 'compresses css', function(){
		var flow = new igneous.Flow({
			name: 'test.css',
			type: 'css',
			files: [
				'test/styles/test1.css',
				'test/styles/test2.css'
			],
			compress: true
		});
		var stub = sinon.stub( flow, '_send' );
		flow._flow();
		var concat_files = 'body{background:#fff}body{color:#000}';
		flow._string.should.equal( concat_files );
	});
	
	it( 'does not compress css when told not to', function(){
		var flow = new igneous.Flow({
			name: 'test.css',
			type: 'css',
			files: [
				'test/styles/test1.css',
				'test/styles/test2.css'
			],
			compress: false
		});
		var stub = sinon.stub( flow, '_send' );
		flow._flow();
		var concat_files = 'body { background: #fff; }\nbody { color: #000; }\n';
		flow._string.should.equal( concat_files );
	});
	
	it( 'creates a temp file', function(){
		var flow = new igneous.Flow({
			name: 'test.css',
			type: 'css',
			files: [
				'test/styles/test1.css',
				'test/styles/test2.css'
			],
			compress: false
		});
		flow._concatenate();
		flow._send();
		var contents = fs.readFileSync( 'test.css', 'utf-8' );
		contents.should.equal( 'body { background: #fff; }\nbody { color: #000; }\n' );
		fs.unlinkSync( 'test.css' );
	});

	//it( 'sends the temp file to S3', function(){
		// TODO write test for this
	//});
	
	//it( 'deletes the temp file', function(){
		// TODO write test for this
	//});
	
	//it( 'sets the url for the Flow object', function(){
		// TODO write test for this
	//});
	
	/*it( 'reflows when one of its component files is changed', function(){
		console.log( igneous );
		var flow = new igneous.Flow({
			name: 'test.css',
			type: 'css',
			files: [
				'test/styles/test1.css',
				'test/styles/test2.css'
			],
			compress: false
		});
		console.log( igneous.flows );
		var stub = sinon.stub( flow, '_flow' );
		var contents = fs.readFileSync( 'test/styles/test1.css', 'utf-8' );
		fs.writeFileSync( 'test/styles/test1.css', 'test', 'utf-8' );
		fs.writeFileSync( 'test/styles/test1.css', contents, 'utf-8' );
		setTimeout( function(){
			stub.called.should.equal( true );
		}, 1000 );
	});*/
	
});