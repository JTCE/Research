
(function (hto, window, document) {
	"use strict";
	var _detectedNewVersion = false;

	function Appcache() {
	}

    // Initializes the appcache event handlers.
	Appcache.prototype.initialize = function () {
	    var self = this;
	    // Handle new versions (appCache).
	    window.applicationCache.addEventListener('updateready', self.onUpdateReady);
	    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
	        self.onUpdateReady();
	    }
	};

	Appcache.prototype.onUpdateReady = function () {

	    if (_detectedNewVersion === false) {
	        // New version detected. Reload the current page, without using the cache.
	        document.location.reload(true);
	    }

	    // Prevents 2 page reloads.
	    _detectedNewVersion = true;
	};

	hto.services.appcache = new Appcache();
	hto.services.appcache.initialize();

}(hto, window, document));