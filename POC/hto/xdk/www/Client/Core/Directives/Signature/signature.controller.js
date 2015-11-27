
(function () {
	"use strict";


	function controller($scope) {
	    /// <summary>
	    /// 
	    /// </summary>
		$scope.version = 0;
	    $scope.selectedLineWidth = 10;

	    $scope.undo = function () {
	        $scope.version--;
	    };
	}

	angular
        .module("hto")
        .controller("Signature", ["$scope", controller]);

}());