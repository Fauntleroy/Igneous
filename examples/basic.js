var express = require('express');
var server = express.createServer();
server.listen( 8080 );

var igneous = require('../lib/igneous.js');

igneous.set( 's3_key', 'S3 KEY' );
igneous.set( 's3_secret', 'S3 SECRET' );
igneous.set( 's3_bucket', 'S3 BUCKET' );

igneous.createFlows({
	'stylesheets.css': {
		type: 'css',
		files: [
			'styles/layout.css',
			'styles/red.css'
		],
		compress: true
	},
	'scripts.js': {
		type: 'js',
		files: [
			'scripts/player.js',
			'scripts/item.js'
		],
		compress: true
	}
});

server.get( '/', function( req, res ){
	res.send('<html>'+
		'<head>'+
			'<link rel="stylesheet" href="'+ igneous.flows['stylesheets.css'].url +'" />'+
			'<script src="'+ igneous.flows['scripts.js'].url +'"></script>'+
		'</head>'+
	'</html>');
});