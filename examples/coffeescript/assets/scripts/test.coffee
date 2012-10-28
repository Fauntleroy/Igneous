square = (x) -> x * x
cube   = (x) -> square(x) * x

window.onload = ->
	document.body.innerHTML = '2^2 = '+ square(2)
	document.body.innerHTML +='<br />2^3 = '+ cube(2);