var fs = require('fs');
var aws = require('aws-lib');

//
// Create Flows
// Accepts array of flow specifications and runs them
//

exports.createFlows = function( flows ){
	
	flows.forEach( function( flow, i ){
		
		// update bundle when flow is changed
		flow.files.forEach( function( file, i ){
			fs.watch( file, function( event, filename ){
				console.log( event, filename );
			});
		});
		
	});
	
};