// var fixture, fixtureHtml;
//
// document.addEventListener("DOMContentLoaded", function() {
// 	fixture = document.getElementById("unmoved-fixture");
// 	fixtureHtml = fixture.innerHTML;
// }, false);
//
// QUnit.begin = function() {
// 	fixture.innerHTML = fixtureHtml;
// };

var sourceElemsHTML = "<source src='assets/popcorntest.mp4'></source>" +
											"<source src='assets/popcorntest.ogv'></source>" +
											"<source src='assets/popcorntest.webm'></source>";

//  Inspired by Underscore.js's _.range(), only...
//  deliriously fast in Chrome: http://jsperf.com/range-vs-range
var Foo = {
	range: function(start, stop, step) {
		start = start || 0;
		stop  = stop || start || 0;
		step  = step || 1;

		var len   = Math.ceil( (stop - start) / step) || 0 ,
			idx   = 0,
			range = [];

		range.length = len;

		while ( idx < len ) {
			range[ idx++ ] = start;
			start += step;
		}
		return range;
	}
};

module("Implementation");
test("Base", function() {

	var videos = document.querySelectorAll("[mediagroup]");

	expect( videos.length );

	[].forEach.call( videos, function( video ) {

		console.log( video );
		equal( video.mediaGroup, video.getAttribute("mediagroup"), "video 'mediagroup' attribute has been transfered to IDL `mediaGroup`" );
	});
});

module("Declarative");
test("Creates mediaGroup from markup", function() {

	var videos = document.querySelectorAll("[mediagroup='pipvisible']");

	expect( videos.length );

	[].forEach.call( videos, function( video ) {

		console.log( video );
		equal( video.mediaGroup, video.getAttribute("mediagroup"), "video 'mediagroup' attribute has been transfered to IDL `mediaGroup`" );
	});

});

module("Imperative");
test("Creates mediaGroup for new elements", function() {

	var receiver = document.getElementById("generated-fixture"),
	createds = {
		a: document.createElement("video"),
		b: document.createElement("video")
	},
	keys = Object.keys( createds ),
	videos,
	expects = 1,
	count = 0;

	expect( expects );

	function plus() {
		if ( ++count == expects ) {
			start();
		}
	}

	stop();

	keys.forEach(function( key, i ) {

		if ( i === 0 ) {
			createds[ key ].controls = true;
			createds[ key ].setAttribute("controls", true);
		}

		createds[ key ].setAttribute("mediagroup", "generated");
		createds[ key ].innerHTML = sourceElemsHTML;

		receiver.appendChild( createds[ key ] );
	});


	createds.b.addEventListener( "canplaythrough", function() {

		createds.a.play();

		setTimeout(function() {

			var a = createds.a.currentTime,
			b = createds.b.currentTime,

			aF = parseFloat( a.toFixed(2) ),
			bF = parseFloat( b.toFixed(2) ),

			aL = aF - 0.02,
			aC = aF + 0.02,

			range,
			inRange;

			inRange = Foo.range( aL, aC, 0.01 ).some(function( floating ) {
				return parseFloat( floating.toFixed(2) ) === parseFloat( b.toFixed(2) );
			});

			ok( inRange, "Video A and Video B are in perceptible synchronization" );
			plus();

			createds.a.pause();
			createds.b.pause();

		}, 500 );
	}, false );
});

