var should = require('should');
var Flow = require('../lib/flow.js');

describe('Flow', function(){

	it( 'sets appropriate MIME types based on type', function(){

	});

	it( 'converts preprocessor strings to methods', function(){

	});

	it( 'converts postprocessor strings to methods', function(){

	});

	describe( '.flow', function(){

		it( 'regenerates the flow\'s store', function(){

		});

	});

	describe( '.add', function(){

		it( 'reads a single file', function(){

		});

		it( 'reads a directory of files', function(){

		});

		it( 'excludes files based on extension', function(){

		});

	});

	describe( '.preprocess', function(){

		it( 'runs files through each specified preprocessor', function(){

		});

	});

	describe( '.concatenate', function(){

		it( 'joins all file data together into a single string', function(){

		});

	});

	describe( '.save', function(){

		it( 'sends file data to be saved by the specified store', function(){

		});

	});

	describe( '.watch', function(){

		it( 'watches all paths', function(){

		});

		it( 'reflows flow on file change', function(){

		});

		it( 'reflows flow on file addition', function(){

		});

		it( 'reflows flow on file removal', function(){

		});

	});

});