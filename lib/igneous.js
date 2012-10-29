var Stores = require('./stores');
var Flow = require('./flow.js');

var middleware;

var igneous = function( options ){

	// Mix in default options
	var config = {
		minify: false,
		watch: true,
		root: __dirname,
		encoding: 'UTF-8'
	};

	for( var key in options ){
		config[key] = options[key];
	}

	// Instantiate host
	if( !config.store ){
		config.store = new Stores.Memory;
	} else if( config.store.toString() === '[object Object]' ){
		config.store = new Stores[config.store.provider]( config.store );
	}

	// Convert flow config into true flows
	var flows = config.flows.map( function( flow_config ){
		return new Flow( flow_config, config );
	});

	middleware = function( req, res, next ){

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
				config.store.get( flow.id, function( data ){
					headers['Content-Type'] = flow.mime_type;
					headers['Content-Length'] = data.length;
					res.writeHead( 200, headers );
					res.end( data );
				});
			}

		} else {
			next();
		}

	};

	return middleware;

};

igneous.middleware = middleware;

// Export Igneous
module.exports = igneous;