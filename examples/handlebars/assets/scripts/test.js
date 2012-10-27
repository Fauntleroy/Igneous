window.onload = function(){

	var markup1 = templates['test1']({ text: 'Test 1 has rendered' });
	var markup2 = templates['test2']({ text: 'Test 2 has rendered' });

	document.body.innerHTML = markup1 + markup2;

};