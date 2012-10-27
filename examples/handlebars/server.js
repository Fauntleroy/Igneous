var express = require('express');
var server = express();
var igneous = require('../../lib/igneous.js');

server.use( igneous({
	root: __dirname +'/assets',
	minify: true,
	flows: [
		{
			route: 'scripts.js',
			type: 'js',
			base: '/scripts',
			paths: [
				'/',
			]
		},
		{
			route: 'templates.js',
			type: 'jst',
			jst_lang: 'handlebars',
			jst_namespace: 'templates',
			base: '/templates',
			paths: [
				'test1.jst',
				'test2.jst',
				'_partial.jst'
			]
		}
	]
}));

server.listen( 8080 );

server.get( '/', function( req, res ){
	res.send('<html>'+
		'<head>'+
			'<script src="/scripts.js"></script>'+
			'<script src="/templates.js"></script>'+
		'</head>'+
	'</html>');
});