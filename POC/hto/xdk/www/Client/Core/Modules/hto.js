(function (angular) {
	/// <summary>
	/// For angular this is the starting point (main) for this app.
	/// </summary>

	"use strict";

	function run() {
		/// <summary>
		/// Initialize fastclick (this will remove 300ms delay on touch devices).
		/// </summary>

		FastClick.attach(document.body);
	}

	angular.module("hto", ["ngCookies"])
           .run(run);
	
}(angular));