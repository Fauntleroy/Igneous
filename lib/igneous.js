var hosts = require('./hosts');
var Flow = require('./flow.js');

var igneous = function( options ){

	// Mix in default options
	var config = {
		compress: false,
		watch: true,
		root: __dirname,
		encoding: 'UTF-8'
	};

	for( var key in options ){
		config[key] = options[key];
	}

	// Validate host
	if( !config.host ){
		throw new Error('\'host\' must be set');
	}

	// Create a new host class if this a config object
	if( config.host.toString() === '[object Object]' ){
		config.host = new hosts[config.host.provider]( config.host );
	}

	// Convert flow config into true flows
	var flows = config.flows.map( function( flow_config ){
		return new Flow( flow_config, config );
	});

	var middleware = function( req, res, next ){

		var file = null;

		flows.forEach( function( flow ){

			var route = flow.route;
			if( typeof route === 'string' ){
				route = new RegExp( route );
			}

			var match = route.test( req.url );

			if( match ){

				file = flow;
				console.log( req.url, ' matched!' );

			}

		});

		if( file ){
			console.log('sendheader, body', file.mime_type);
			res.writeHead( 200, {
				'Content-Type': file.mime_type
			});
			res.end( file.data );
		} else {
			next();
		}

	};

	return middleware;

};

// Export Igneous
module.exports = igneous;