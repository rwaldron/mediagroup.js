/*!
 * mediagroup.js
 *
 * Copyright 2011, Rick Waldron
 * Licensed under MIT license.
 *
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#assigning-a-media-controller-declaratively
 */
(function( window, document ) {

	window.requestAnimFrame = (function( window ) {
		var suffix = "equestAnimationFrame",
			rAF = [ "r", "webkitR", "mozR", "msR", "oR" ].filter(function( val ) {
				return val + suffix in window;
			})[ 0 ] + suffix;

		return window[ rAF ]	|| function( callback, element ) {
			window.setTimeout(function() {
				callback( +new Date );
			}, 1000 / 60);
		};
	})( window );

	// Unary Array.from()
	// https://gist.github.com/1074126
	Array.from = function( arrayish ) {
		return [].slice.call( arrayish );
	};

	function mediaGroupSetup() {
		// Declare program references
		// nodelist: a NodeList of all elements with `mediagroup` attributes
		// elements: `nodelist` as a real Array
		// filtereds: object whose properties are the value of a `mediagroup` attribute,
		//            with values that are arrays of corresponding elements
		// mediagroups: unique array of each mediagroup name
		var nodelist = document.querySelectorAll("[mediagroup]"),
			elements = Array.from( nodelist ),
			filtereds = {},
			mediagroups = elements.map(function( elem ) {
				return elem.getAttribute( "mediagroup" );
			}).filter(function( val, i, array ) {
				if ( !filtereds[val] ) {
					filtereds[ val ] = elements.filter(function( elem ) {
						return elem.getAttribute( "mediagroup" ) === val;
					});
					return true;
				}
				return false;
			});

		// Iterate all collected mediagroup names
		// Call mediaGroup() with group name and nodelist params
		mediagroups.forEach(function( group ) {
			mediaGroup( group, filtereds[ group ] );
		});
	}

	function mediaGroupSync( controller, children ) {

		children.forEach(function( child ) {
			child.currentTime = controller.currentTime;
		});

		requestAnimFrame(function() {
			mediaGroupSync( controller, children );
		});
	}

	function mediaGroupListeners( controller, elements, callback ) {

		var events = [ "play", "pause" ];

		// Dispatch events across all children elements
		events.forEach(function( type, i ) {

			// Define listeners for parent controller element
			controller.addEventListener( type, function() {

				var evt = document.createEvent( "Events" );

				evt.initEvent(
					type, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
				);

				// Delegate events to children
				children.forEach(function( child ) {
					cb.dispatchEvent(evt);
				});
			});

			if ( (i + 1) === events.length ) {
				callback();
			}
		});
	}

	function mediaGroup( group, elements ) {

		var controller, children,
			ready = 0;

		// Get the single controller element
		controller = elements.filter(function( elem ) {
			return !!elem.controls;
		})[ 0 ];

		// Filter nodelist for all elements that will
		// be controlled by the	controller element
		children = elements.filter(function( elem ) {
			return !elem.controls;
		});

		// Declare context sensitive `canplay` handler
		function canPlay() {

			if ( ++ready === elements.length ) {

				// Now that it is safe to play the video, remove the handlers
				elements.forEach(function( elem ) {
					elem.removeEventListener( "canplay", canPlay, false );
				});

				mediaGroupListeners( controller, elements, function() {

					mediaGroupSync( controller, children );

				});

			}
		}

		// Iterate all elements in mediagroup set
		// Add `canplay` event listener, this ensures that setting currentTime
		// doesn't throw exception (Code 11) by tripping seek on a media element
		// that is not yet seekable
		elements.forEach(function( elem ) {

			// Set the actual element IDL property `mediaGroup`
			elem.mediaGroup = elem.getAttribute( "mediagroup" );

			elem.addEventListener( "canplay", canPlay, false );
		});
	}

	// Listen for mutation events
	[ "DOMNodeInserted", "DOMAttrModified" ].forEach(function( mutation ) {

		document.addEventListener( mutation, function( event ) {

			var element = event.target,
			valid = [ "AUDIO", "VIDEO" ].some(function( val ) {
				return element.nodeName === val;
			});

			if ( valid ) {
				console.log( event );
			}
		});
	});

	// Autocreate mediagroup sets when DOM is ready
	document.addEventListener( "DOMContentLoaded", function() {

		// Feature detect for mediagroup support.
		// If Host has support, return and do nothing.
		if ( "mediaGroup" in document.createElement("video") ) {
			return;
		}

		mediaGroupSetup();

	}, false );

	// TODO: How to ensure that new nodes with mediagroup attrs are recognized

})( this, this.document );
