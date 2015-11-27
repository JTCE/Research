
// Angular module.
(function () {
    "use strict";

    angular
        .module("app", ["ngAnimate", "ngSanitize", "kendo.directives"]);

}());

// Angular "main" controller.
(function () {
    "use strict";

    function controller($scope) {
        $scope.title = "AngularJS and jQuery test page.";
    }

    angular
        .module("app")
        .controller("main", ["$scope", controller]);
}());

// Angular "dashboard" directive.
(function () {
    "use strict";

    function directive() {

        function link($scope, element) {
            console.log("Dasbhoard loaded.");

            $scope.load = function () {
                console.log("Load clicked.");
                $scope.refresh();
            };
        }

        return {
            restrict: 'EA',
            templateUrl: '/angular/angular.kendo.dashboard.html',
            link: link
        };
    }

    angular
        .module('app')
        .directive('appDashboard', [directive]);

}());

// Angular "settings" directive.
(function () {
    "use strict";

    function directive() {

        function link($scope, element) {
            console.log("Settings loaded.");

            $scope.tmpUrl = '/angular/angular.kendo.settings.content.html'
        }

        return {
            restrict: 'EA',
            templateUrl: '/angular/angular.kendo.settings.html',
            link: link
        };
    }

    angular
        .module('app')
        .directive('appSettings', [directive]);

}());


// Angular "settings content" directive.
(function () {
    "use strict";

    function directive() {

        function link($scope, element) {
            console.log("Settings content loaded.");

            

            $scope.myDropDownListDataSource = new kendo.data.DataSource({
                data: [
                    { "id": 1, "naam": "John" },
                    { "id": 2, "naam": "Harold" },
                    { "id": 3, "naam": "Peter" },
                    { "id": 4, "naam": "Martin" }
                ]
            });

            $scope.myDropDownListOptions = {
                dataSource: $scope.myDropDownListDataSource,
                dataTextField: "naam",
                dataValueField: "id"
            };

            $scope.$parent.refresh = function () {
                console.log("Refresh called.");
                var data = [
                    { "id": 1, "naam": "Naam 1" },
                    { "id": 2, "naam": "Naam 2" },
                    { "id": 3, "naam": "Naam 3" },
                    { "id": 4, "naam": "Naam 4" }
                ]
                $scope.myDropDownListDataSource.data(data);
                $scope.myDropDownList.select(1);
                $scope.myDropDownList.select(0);
            };
        }

        return {
            restrict: 'EA',
            link: link
        };
    }

    angular
        .module('app')
        .directive('appSettingsContent', [directive]);

}());