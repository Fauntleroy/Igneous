var handlebars = require('handlebars');

module.exports = function( path, contents, flow ){
	console.log('templet path', path );
	var namespace = flow.config.jst_namespace;
	var path_clean = path.split('.').splice( 0, path.split('.').length-1 )[0];
	var name = path_clean;
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