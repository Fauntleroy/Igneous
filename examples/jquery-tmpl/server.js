var express = require('express');
var server = express();
var igneous = require('../../lib/igneous.js');

server.use( igneous({
	root: __dirname +'/assets',
	minify: true,
	flows: [
		{
			route: 'templates.js',
			type: 'jst',
			jst_lang: 'jquery-tmpl',
			jst_namespace: 'templates',
			base: '/templates',
			paths: [
				'/'
			]
		},
		{
			route: 'scripts.js',
			type: 'js',
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
			'<script src="templates.js"></script>'+
		'</head>'+
		'<body></body>'+
	'</html>');
});