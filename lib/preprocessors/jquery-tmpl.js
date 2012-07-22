module.exports = function( path, contents, flow ){
	
	var namespace = flow.jst_namespace;
	var path_clean = path.split('.').splice( 0, path.split('.').length-1 )[0];
	var path_bits = path_clean.split('/');
	var name = path_bits[path_bits.length-1];
	var contents_escaped = contents.replace( /\\/ig, '\\\\' ).replace( /"/ig, '\\x22' ).replace( /'/ig, "\'" );
	var processed = '';
	
	processed = '(function(){';
	processed += 'this.'+ namespace +' || (this.'+ namespace +' = {});';
	processed += 'this.'+ namespace +'["'+ path_clean +'"] = function( data ){ return jQuery.tmpl( "'+ contents_escaped +'", data ); };';
	processed += '}).call(this);';
	
	return processed;
	
};