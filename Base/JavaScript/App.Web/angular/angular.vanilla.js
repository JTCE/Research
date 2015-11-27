
// Angular module.
(function () {
    "use strict";

    angular
        .module("app", ["ngAnimate", "ngSanitize"]);
}());

// Angular controller.
(function () {
    "use strict";

    function controller($scope) {
        $scope.title = "AngularJS and jQuery test page.";
        $scope.price = 4.4;
    }

    angular
        .module("app")
        .controller("main", ["$scope", controller]);
}());