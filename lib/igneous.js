var Stores = require('./stores');
var Flow = require('./flow.js');
var socketio = require('socket.io');

var middleware = function( req, res, next ){

	var flow;
	var flows = module.exports.flows;

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
			flow.store.get( flow.id, function( data ){
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

var igneous = function( options ){

	// Mix in default options
	var igneous = this;
	var config = this.config = {
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
	module.exports.flows = config.flows.map( function( flow_config ){
		return new Flow( flow_config, igneous );
	});

	// Livereload
	if( options.io || options.http_server ){
		this.io = options.io || socketio.listen( options.http_server );
		io.of('/igneous').on( 'connection', function( client ){

			var flows = module.exports.flows;
			var file_listeners = [];

			client.on( 'add', function( file ){
				if( file_listeners.indexOf( file ) >= 0 ) return;
				for( var i in flows ){
					var flow = flows[i];
					var route = flow.route;
					if( !route.test ) route = new RegExp( route );
					if( route.test( file ) ){
						file_listeners.push( file );
						flow.on( 'save', function( flow ){
							client.emit( 'reload', file );
						});
						return;
					}
				}
			});

			// TODO get rid of listeners
			client.on( 'disconnect', function(){

			});

		});
	}

	return middleware;

};

module.exports = igneous;
module.exports.middleware = middleware;