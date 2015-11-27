var app;
(function (app) {
    "use strict";
    function run() {
        // Initialize fastclick (this will remove 300ms delay on touch devices).
        FastClick.attach(document.body);
    }
    // Initialize Angular with "leaflet", so we can use the "leaflet directive" in the application.
    angular.module("app", ["leaflet-directive"])
        .run(run);
    function controller($scope) {
        // TODO: inject ioc.service.
        $scope.vm = new app.models.LandingPage();
    }
    angular
        .module("app")
        .controller("MainController", ["$scope", controller]);
})(app || (app = {}));
//# sourceMappingURL=app.js.map