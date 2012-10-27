module.exports = function( path, contents, flow ){
	
	var namespace = flow.config.jst_namespace;
	var path_clean = path.split('.').splice( 0, path.split('.').length-1 )[0];
	var name = path_clean;
	var contents_escaped = contents.replace( /\\/ig, '\\\\' ).replace( /"/ig, '\\x22' ).replace( /'/ig, "\'" );
	var processed = '';
	
	processed = '(function(){';
	processed += 'this.'+ namespace +' || (this.'+ namespace +' = {});';
	processed += 'this.'+ namespace +'["'+ path_clean +'"] = function( data ){ return Mustache.render( "'+ contents_escaped +'", data ); };';
	processed += '}).call(this);';

	return processed;
	
};