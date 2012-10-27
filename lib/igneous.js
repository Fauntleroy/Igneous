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

		var flow;

		// Check all our flows for a matching route
		for( var i in flows ){

			var route = flows[i].route;
			if( typeof route === 'string' ){
				route = new RegExp( route );
			}
			var match = route.test( req.url );

			if( match ){
				flow = flows[i];
				break;
			}

		}

		// We have a flow, prepare the response
		if( flow ){

			var headers = {
				'Last-Modified': flow.modified.toUTCString(),
				'Expires': new Date( new Date().getTime() + 365 * 24 * 60 * 60 * 1000 ).toUTCString(),
				'Vary': 'Accept-Encoding'
			};
			var modified_since = req.headers['if-modified-since'];

			if( modified_since && Date.parse( modified_since ) >= Date.parse( flow.modified ) ){
				res.writeHead( 304, headers );
				res.end();
			} else {
				headers['Content-Type'] = flow.mime_type;
				headers['Content-Length'] = flow.data.length;
				res.writeHead( 200, headers );
				res.end( flow.data );
			}

		} else {
			next();
		}

	};

	return middleware;

};

// Export Igneous
module.exports = igneous;