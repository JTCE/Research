
(function (hto, navigator) {
	"use strict";

	function Geolocation() {
	}

	Geolocation.prototype.getPosition = function (q) {
		var deferred = q.defer();
		
		function onError() {
			deferred.reject(new Error("Unable to get current position."));
		}

		function onSuccess(position) {
			deferred.resolve(position);
		}

		navigator.geolocation.getCurrentPosition(onSuccess, onError);

		return deferred.promise;
	};

	Geolocation.prototype.isSupported = function () {
		var result = false;
		if (navigator.geolocation) {
			result = true;
		}
		return result;
	};

	hto.services.geolocation = new Geolocation();

}(hto, navigator));