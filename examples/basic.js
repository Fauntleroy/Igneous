var express = require('express');
var server = express.createServer();
server.use( express.static('./assets') );
server.listen( 8080 );

var igneous = require('../lib/igneous.js');

igneous.config({
	host: {
		provider: 'local',
		path: __dirname +'/assets/flows/',
		url: '/flows/'
	},
	compress: false,
	debug: true
	/*host: {
		provider: 's3',
		aws_key: '',
		aws_secret: '',
		bucket: ''
	},*/
});

igneous.createFlows([
	{
		name: 'stylesheets.css',
		type: 'css',
		base_path: __dirname +'/assets/styles/',
		paths: [
			'/'
		]
	},
	{
		name: 'scripts.js',
		type: 'js',
		base_path: __dirname +'/assets/scripts/',
		paths: [
			'/'
		]
	},
	{
		name: 'templates.js',
		type: 'jst',
		base_path: __dirname +'/assets/templates/',
		paths: [
			'test1.jst',
			'test2.jst',
			'_partial.jst'
		],
		jst_lang: 'handlebars',
		jst_namespace: 'templates'
	}
]);

server.get( '/', function( req, res ){
	res.send('<html>'+
		'<head>'+
			igneous.tag('stylesheets.css') +
			igneous.tag('scripts.js') +
			igneous.tag('templates.js') +
		'</head>'+
	'</html>');
});