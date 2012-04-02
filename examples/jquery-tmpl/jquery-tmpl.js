var express = require('express');
var server = express.createServer();
server.use( express.static('./bundles') );
server.listen( 8080 );

var igneous = require('../../lib/igneous.js');

igneous.set( 'mode', 'local' );
igneous.set( 'local_path', './bundles' );

igneous.createFlows({
	'templates.js': {
		type: 'jst',
		jst_lang: 'jquery-tmpl',
		jst_namespace: 'templates',
		paths: [
			'templates'
		],
		compress: true
	},
	'scripts.js': {
		type: 'js',
		paths: [
			'scripts'
		],
		compress: true
	}
});

server.get( '/', function( req, res ){
	res.send('<html>'+
		'<head>'+
			'<script src="scripts.js"></script>'+
			'<script src="templates.js"></script>'+
		'</head>'+
		'<body></body>'+
	'</html>');
});