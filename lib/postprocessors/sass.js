try {

var sass = require('node-sass');

module.exports = function( contents, config, callback ){

	sass.render( contents, function( err, css ){

		if( err ){
			throw Error( err );
		}

		callback( css );

	});

};

}
catch( err ){

	console.log('Igneous - WARNING: node-sass could not be installed on this system.');

	module.exports = function(){};
	
}