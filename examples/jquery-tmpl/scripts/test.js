$( function(){
	var test_rendered = templates['templates/test']({ text: 'Hello World!' });
	var test2_rendered = templates['templates/test2']({ text: 'Hello Again, World!' });
	$('body').append( test_rendered, test2_rendered );
});