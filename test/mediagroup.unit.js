var fixture, fixtureHtml;

document.addEventListener("DOMContentLoaded", function() {
	fixture = document.getElementById("unmoved-fixture");
	fixtureHtml = fixture.innerHTML;
}, false);

QUnit.begin = function() {
	fixture.innerHTML = fixtureHtml;
};

module("Implementation");
test("Base", function() {

	var videos = document.querySelectorAll("video[mediagroup]");

	expect( videos.length );

	[].forEach.call( videos, function( video ) {
		equal( video.mediaGroup, video.getAttribute("mediagroup"), "video 'mediagroup' attribute has been transfered to IDL `mediaGroup`" );
	});
});

module("Declarative");
test("Creates mediaGroup from markup", function() {

});

module("Imperative");
test("Creates mediaGroup for new elements", function() {

});

