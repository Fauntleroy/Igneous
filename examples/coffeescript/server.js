var express = require('express');
var server = express();
var igneous = require('../../lib/igneous.js');

server.use( igneous({
	root: __dirname +'/assets',
	minify: true,
	flows: [
		{
			route: 'scripts.js',
			type: 'coffee',
			base: '/scripts',
			paths: [
				'/'
			]
		}
	]
}));

server.listen( 8080 );

server.get( '/', function( req, res ){
	res.send('<html>'+
		'<head>'+
			'<script src="scripts.js"></script>'+
		'</head>'+
		'<body></body>'+
	'</html>');
});