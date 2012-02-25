module.exports = function( flow ){
	
	var namespace = flow.jst_namespace;
	
	flow._strings.forEach( function( string, i ){
		
		var path = flow.files[i];
		var path_clean = path.split('.').splice( 0, path.split('.').length-1 )[0];
		var path_bits = path_clean.split('/');
		var name = path_bits[path_bits.length-1];
		var string_escaped = string.replace( /\\/ig, '\\\\' ).replace( /"/ig, '\\x22' ).replace( /'/ig, "\'" );
		var processed = '';
		
		processed = '(function(){';
		processed += 'this.'+ namespace +' || (this.'+ namespace +' = {});';
		processed += 'this.'+ namespace +'["'+ path_clean +'"] = function( data ){ return jQuery.tmpl( "'+ string_escaped +'", data ); };';
		processed += '}).call(this);';
		
		flow._strings[i] = processed;
		
	});
	
};