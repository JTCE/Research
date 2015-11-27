
// Angular module.
(function () {
    "use strict";

    angular
        .module("spike", ["ngAnimate", "ngSanitize"]);

}());

// Angular controller.
(function () {
    "use strict";

    function controller($scope) {
        $scope.title = "AngularJS and jQuery test page.";
    }

    angular
        .module("spike")
        .controller("main", ["$scope", controller]);

}());