
(function (hto) {
	"use strict";

	function directive() {
		/// <summary>
	    /// Represent a login screen.
        /// It expects a $scope.app.user of type "hto.models.User".
		/// </summary>

	    function link($scope, $element) {
		    $element[0].focus();
		}

		return {
		    link: link,
		    restrict: "EA",
		};
	}

	angular
        .module("hto")
        .directive("htoLogin", [directive]);

}(hto));