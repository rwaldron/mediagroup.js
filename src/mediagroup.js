/*!
 * mediagroup.js
 *
 * Copyright 2011, Rick Waldron
 * Licensed under MIT license.
 *
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#assigning-a-media-controller-declaratively
 */
(function( window, document, mediagroup ) {

	var requestAnimFrame = (function( window ) {
		var suffix = "equestAnimationFrame",
			rAF = [ "r", "webkitR", "mozR", "msR", "oR" ].filter(function( val ) {
				return val + suffix in window;
			})[ 0 ] + suffix;

		return window[ rAF ]	|| function( callback, element ) {
			window.setTimeout(function() {
				callback( +new Date() );
			}, 1000 / 60);
		};
	})( window );

	// Unary Array.from()
	// https://gist.github.com/1074126
	Array.from = function( arrayish ) {
		return [].slice.call( arrayish );
	};

	function mediaGroupSync( controller, slaves ) {

		if ( slaves.length ) {
			slaves.forEach(function( slave ) {
				if ( slave.currentTime !== controller.currentTime ) {
					slave.currentTime = controller.currentTime;
				}
			});
		}

		requestAnimFrame(function() {
			mediaGroupSync( controller, slaves );
		});
	}

	function mediaGroupListeners( controller, slaves, callback ) {

		// var events = [ "play", "pause" ];
		//
		// // Dispatch events across all slaves elements
		// events.forEach(function( type, i ) {
		//
		// // Define listeners for parent controller element
		// controller.addEventListener( type, function() {
		//
		//   var evt = document.createEvent( "Events" );
		//
		//   evt.initEvent(
		//     type, true, true, window
		//   );
		//
		//     // Delegate events to slaves
		//   slaves.forEach(function( slave ) {
		//     slave.dispatchEvent( evt );
		//   });
		// });
		//
		// if ( (i + 1) === events.length ) {
		//     callback();
		// }
		// });

		callback();
	}

	function mediaGroup( group, elements ) {

		var controller, slaves,
			ready = 0;

		// Get the single controller element
		controller = elements.filter(function( elem ) {
			return !!elem.controls || elem.getAttribute("controls", true);
		})[ 0 ];

		// Filter nodelist for all elements that will
		// be controlled by the	controller element
		slaves = elements.filter(function( elem ) {
			return !elem.controls;
		});

		if ( !controller ) {
			return;
		}

		// Declare context sensitive `canplay` handler
		function canPlay() {

			if ( ++ready === elements.length ) {

				// Now that it is safe to play the video, remove the handlers
				elements.forEach(function( elem ) {
					elem.removeEventListener( "canplay", canPlay, false );
				});

				mediaGroupListeners( controller, elements, function() {
					mediaGroupSync( controller, slaves );
				});
			}
		}

		// Iterate all elements in mediagroup set
		// Add `canplay` event listener, this ensures that setting currentTime
		// doesn't throw exception (Code 11) by tripping seek on a media element
		// that is not yet seekable
		elements.forEach(function( elem ) {

			// Set the actual element IDL property `mediaGroup`
			elem.mediaGroup = elem.getAttribute( mediagroup );

			elem.addEventListener( "canplay", canPlay, false );
		});
	}

	function mediaGroupSetup( selector ) {
		// Declare program references
		// nodelist: a NodeList of all elements with `mediagroup` attributes
		// elements: `nodelist` as a real Array
		// filtereds: object whose properties are the value of a `mediagroup` attribute,
		//            with values that are arrays of corresponding elements
		// mediagroups: unique array of each mediagroup name
		var nodelist = document.querySelectorAll( selector || "[" + mediagroup + "]" ),
			elements = Array.from( nodelist ),
			filtereds = {},
			mediagroups;

			// Allow only if no `mediaGroup` property exists
			elements = elements.filter(function( elem ) {
				return !elem.mediaGroup;
			});

			// Filter for groupnames
			mediagroups = elements.map(function( elem ) {
				return elem.getAttribute( mediagroup );
			}).filter(function( val, i, array ) {
				if ( !filtereds[ val ] ) {
					filtereds[ val ] = elements.filter(function( elem ) {
						return elem.getAttribute( mediagroup ) === val;
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

	// Listen for mutation events
	[ "DOMNodeInserted", "DOMAttrModified" ].forEach(function( mutation ) {

		document.addEventListener( mutation, function( event ) {

			// Feature detect for mediagroup support.
			// If Host has support, return and do nothing.
			if ( "mediaGroup" in document.createElement("video") ) {
				return;
			}

			var element = event.target,
			valid = [ "AUDIO", "VIDEO" ].some(function( val ) {
				return element.nodeName === val;
			});

			if ( valid && !element.mediaGroup &&
					(element.controls || element.getAttribute("controls") === "true") ) {

				window.setTimeout(function() {
					mediaGroupSetup( "[" + mediagroup + "='" + element.getAttribute( mediagroup ) + "']" );
				}, 100 );
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

})( this, this.document, "mediagroup" );
