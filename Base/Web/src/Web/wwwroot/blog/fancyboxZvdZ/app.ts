module fb {
    "use strict";

    // Register angular app.
    var appName = 'app';
    export var app = angular.module(appName, []);

    // Boot angular, when DOM is loaded.
    angular.element(document).ready(function () {
        angular.bootstrap(document, [appName]);
    });
}