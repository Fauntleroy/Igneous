var handlebars = require('handlebars');

module.exports = function( path, contents, flow ){
	
	var namespace = flow.jst_namespace;
	var path_clean = path.split('.').splice( 0, path.split('.').length-1 )[0];
	var path_bits = path_clean.split('/');
	var name = path_bits[path_bits.length-1];
	var compiled_hbs = handlebars.precompile( contents );
	var processed = '';
		
	if( name.charAt(0) === '_' ){
		processed = '(function() {';
		processed += 'Handlebars.registerPartial("'+ name.slice( 1, name.length ) +'", Handlebars.template('+ compiled_hbs +'));';
		processed += '}).call(this);';
	}
	else {
		processed = '(function(){';
		processed += 'this.'+ namespace +' || (this.'+ namespace +' = {});';
		processed += 'this.'+ namespace +'["'+ path_clean +'"] = function( data ){ return Handlebars.template('+ compiled_hbs +')( data ); };';
		processed += '}).call(this);';
	}
	
	return processed;

};