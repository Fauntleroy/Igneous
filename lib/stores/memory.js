var files = {};

var MemoryStore = function( config ){

	this.save = function( file, callback ){
		
		files[file.id] = file.data;

		callback( file );

	};

	this.get = function( id, callback ){

		callback( files[id] );

	};

};

module.exports = MemoryStore;