var knox = require('knox');

module.exports = function( config ){

	if( !config.aws_key )
		throw new Error('\'aws_key\' must be set');
	if( !config.aws_secret )
		throw new Error('\'aws_secret\' must be set');
	if( !config.bucket )
		throw new Error('\'bucket\' must be set');

	// Create knox client
	s3 = knox.createClient({
		key: config.aws_key,
		secret: config.aws_secret,
		bucket: config.bucket
	});

	this.store = function( flow, callback ){
		
		// TODO send the new file directly to S3
		var time = new Date().getTime();
		var request = s3.put( '/'+ time +'_'+ flow.name, {
			'Content-Length': flow.string.length,
			'Content-Type': flow.content_type
		});

		request.on( 'response', function( res ){

			if( res.statusCode !== 200 )
				throw new Error( 'S3 upload failed' );
			else {
				flow.url = res.client._httpMessage.url;
				callback( flow );
			}

		});

		request.on( 'error', function( err ){ throw new Error( err ); });

		request.end( flow.string );

	};

};