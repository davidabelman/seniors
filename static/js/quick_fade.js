x=0
gap = 100
fade = 700
setTimeout( function() {
	$('.quick-fade-1').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-2').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-3').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-4').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-5').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-6').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-7').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-8').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-9').fadeTo( fade , 1 )
}, x)
x=x+gap
setTimeout( function() {
	$('.quick-fade-10').fadeTo( fade , 1 )
}, x)
x=x+gap


// GRAVEYARD

// function quick_fade_in() {
// 	var fade_length = 500
// 	var gap = 200
// 	var max_element = 10
// 	var i = 1
// 	for (var i = 0; i<max_element; i++) {
// 		var wait = i*gap
// 		var classname = '.quick-fade-'+i
// 		setTimeout( function(classname) {
// 			console.log(classname)
// 			console.log(i)
// 			$(classname).fadeIn(fade_length)
// 		}, wait)
// 	}
// }
// quick_fade_in()