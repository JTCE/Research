var zvdz;
(function (zvdz) {
    var login;
    (function (login) {
        "use strict";
        function controller($scope) {
            $scope.customer = {
                name: 'Naomi',
                address: '1600 Amphitheatre'
            };
        }
        login.controller = controller;
        zvdz.app.controller("LoginController", controller);
        function component() {
            return {
                restrict: "AE",
                templateUrl: "login/login.html"
            };
        }
        login.component = component;
        zvdz.app.directive("login", component);
    })(login = zvdz.login || (zvdz.login = {}));
})(zvdz || (zvdz = {}));
