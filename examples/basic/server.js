var express = require('express');
var server = express();
var igneous = require('../../lib/igneous.js');

server.use( igneous({
	root: __dirname +'/assets',
	minify: true,
	flows: [
		{
			route: 'styles.css',
			type: 'css',
			base: '/styles',
			paths: [
				'/'
			]
		},
		{
			route: 'scripts.js',
			type: 'js',
			base: '/scripts',
			paths: [
				'/',
				'nested'
			]
		}
	]
}));

server.listen( 8080 );

server.get( '/', function( req, res ){
	res.send('<html>'+
		'<head>'+
			'<link href="/styles.css" rel="stylesheet" />'+
			'<script src="/scripts.js"></script>'+
		'</head>'+
		'<body>'+
		'</body>'+
	'</html>');
});