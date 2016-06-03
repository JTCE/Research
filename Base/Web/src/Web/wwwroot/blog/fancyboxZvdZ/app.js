var fb;
(function (fb) {
    "use strict";
    // Register angular app.
    var appName = 'app';
    fb.app = angular.module(appName, []);
    // Boot angular, when DOM is loaded.
    angular.element(document).ready(function () {
        angular.bootstrap(document, [appName]);
    });
})(fb || (fb = {}));
//# sourceMappingURL=app.js.map