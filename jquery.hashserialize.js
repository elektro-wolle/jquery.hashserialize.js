/*
 * simple history-manager for ajax-applications.
 *
 * The current state of the AJAX-Script is encoded via window.location.hash
 *
 * (c) 2013 Wolfgang Jung (code@elektrowolle.de)
 *
 * License: MIT
 *
 * Usage within your HTML code:
 *
 *      $(function() {
 *      var ajaxState = {};
 *              $.restoreFromHash(function(state) {
 *          // retrieve anything you need from the current state
 *                      $("#caption").html(state["caption"]);
 *          $.ajax(..., data : { "search" : state["searchTerm"] }, ...);
 *              });
 *              $("#event").click(
 *                              function() {
 *                                      ajaxState["caption"] = ...;
 *                                      ajaxState["searchTerm"] = ...;
 *                                      ....
 *                                      $.serializeToHash(ajaxState);
 *                                      ....
 *                              });
 *      });
 */
(function($, undefined) {
	// Helper functions for unicode <-> hex conversions
	var unicodeToHex = function(str) {
		var hex = '';
		for (var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			// encode string as utf-8 in hex
            if (c<128) {
            	hex += c.toString(16);
            } else if((c>127) && (c<2048)) {
            	hex += ((c>>6)|192).toString(16);
            	hex += ((c&63)|128).toString(16);
            } else {
            	hex += ((c>>12)|224).toString(16);
            	hex += (((c>>6)&63)|128).toString(16);
            	hex += ((c&63)|128).toString(16);
            }
		}
		return hex;
	};
	
	var hexToUnicode = function(encoded) {
		// decode hex -> utf-8
		var str = '';
		 for (var i = 0; i<encoded.length; i+=2) {
		   str += String.fromCharCode(parseInt(encoded.substr(i, 2), 16));
		 }
		 // decode utf-8 to unicode
		 var i=0; 
		 var jsonString = '';
		 while(i<str.length) {
		     c = str.charCodeAt(i);
		     if (c<128) {
		    	 jsonString += String.fromCharCode(c);
		         i++;
		     } else if((c>191) && (c<224)) {
		    	 jsonString += String.fromCharCode(((c&31)<<6) | (str.charCodeAt(i+1) &63));
		         i+=2;
		     } else {
		    	 jsonString += String.fromCharCode(((c&15)<<12) | ((str.charCodeAt(i+1)&63)<<6) | (str.charCodeAt(i+2)&63));
		         i+=3;
		     }
		 }
		 return jsonString;
	};
	var decodedObject = undefined;
	var withinSerialize = false;
	var callbacks = $.Callbacks();
	// Helperfunction for restore
	$.fn.extend({
		_restoreFromLocationHash : function(e) {
			// check, if hash is present
			if (window.location.hash != '') {
				if (decodedObject == undefined) {
					var encoded = window.location.hash.substr(1);
					var jsonString = hexToUnicode(encoded);
					 // parse JSON Object
		  			 try {
		  				decodedObject = $.parseJSON(jsonString);
						// callback to user-space for reload of AJAX-Content
		  			 } catch (ex) {
						// ignore
		  			 }
				}
				if (decodedObject != undefined && withinSerialize == false) {
					callbacks.fire(decodedObject);
				}					
			} else if (e && e.type == 'hashchange') {
				// Back-button to first page without location.hash -> trigger
				// reload
				window.location.reload();
			}
			withinSerialize = false;
		}});

	// JQuery-Extension
	$.extend({
		restoreFromHash : function(cb) {
			if (callbacks.has(cb) == false) {
				// remember callback function
				callbacks.add(cb);
			}
			// load data after reload of page
			$.fn._restoreFromLocationHash();
		},
		serializeToHash : function(obj) {
			// Serialize obj as JSON -> convert to utf-8 -> convert to hex
			var jsonString = JSON.stringify(obj);
			var hex = unicodeToHex(jsonString);
			withinSerialize = true;
			window.location.hash = hex;
		}
	});
})(jQuery);
(function($, undefined) {
	// bind to hashchange-event, so that the callback is invoked on history.back
	// and history.forward
	$(window).bind("hashchange", $.fn._restoreFromLocationHash);
})(jQuery);
