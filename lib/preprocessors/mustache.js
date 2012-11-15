module.exports = function( file, config, callback ){
	
	var namespace = config.jst_namespace;
	var path_clean = file.path.split('.').splice( 0, file.path.split('.').length-1 )[0];
	var name = path_clean.replace(/\\/g,'/').replace( /^\//, '' ).replace( /\/$/, '' );
	var contents_escaped = file.contents.replace( /\\/ig, '\\\\' ).replace( /"/ig, '\\x22' ).replace( /'/ig, "\'" ).replace( /[\r\n]/g, '');
	var processed = '';
	
	processed = '(function(){';
	processed += 'this.'+ namespace +' || (this.'+ namespace +' = {});';
	processed += 'this.'+ namespace +'["'+ name +'"] = function( data ){ return Mustache.render( "'+ contents_escaped +'", data ); };';
	processed += '}).call(this);';

	callback( processed );
	
};