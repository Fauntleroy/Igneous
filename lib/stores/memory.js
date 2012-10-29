var MemoryStore = function( config ){

	var files = this.files = {};

	this.save = function( file, callback ){
		
		files[file.id] = file.data;

		callback();

	};

	this.get = function( id, callback ){

		callback( files[id] );

	};

};

module.exports = MemoryStore;