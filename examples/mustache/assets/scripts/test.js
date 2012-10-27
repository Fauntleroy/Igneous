window.onload = function(){

	var test1 = templates['test']({ text: 'Test 1 has rendered' });
	var test2 = templates['test2']({ text: 'Test 2 has rendered' });
	
	document.body.innerHTML = test1 + test2;

};