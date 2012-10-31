var should = require('should');
var sinon = require('sinon');
var MemoryStore = require('../../lib/stores/memory.js');

describe( 'MemoryStore', function(){

	var memory = new MemoryStore();

	describe( '.save', function(){

		it( 'stores file data in memory', function( cb ){

			var file = {
				id: 1,
				data: 'test'
			};
			var callback = sinon.spy();

			memory.save( file, function(){

				memory.files[file.id].should.equal(file.data);
				cb();

			});

		});

	});

	describe( '.get', function(){

		it( 'retrieves file data from memory', function( cb ){

			memory.files = {};
			memory.files[1] = 'test';

			memory.get( 1, function( data ){

				data.should.equal(memory.files[1]);
				cb();

			});

		});

	});

});