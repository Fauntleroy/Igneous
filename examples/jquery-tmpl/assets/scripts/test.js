$( function(){

	var test1 = templates['test']({ text: 'Test 1 has rendered' });
	var test2 = templates['test2']({ text: 'Test 2 has rendered' });
	$('body').append( test1, test2 );

});