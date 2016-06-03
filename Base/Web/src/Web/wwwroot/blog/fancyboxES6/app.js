System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var appName;
    function start() {
        console.log("started !!!!");
        registerAngularComponents();
        bootAngular();
    }
    exports_1("start", start);
    function bootAngular() {
        // Angular may only be booted, when the dom is loaded.
        angular.element(document).ready(function () {
            var root = document; // Use the document as root for our application.   
            angular.bootstrap(root, [appName]);
            dynamicallyAddPage();
        });
    }
    /**
     * Dynamically add app component.
     */
    function dynamicallyAddPage() {
        var template = `
        <div ng-controller="WizardController">
            <span ng-bind="name"></span>
        </div>
    `;
        var $document = angular.element(document);
        var $scope = $document.scope();
        $document.injector().invoke(function ($compile) {
            var domElements = $compile(template)($scope);
            $(document.body).append(domElements);
            $scope.$digest();
        });
    }
    function registerAngularComponents() {
        // Register app.
        var app = angular.module(appName, []);
        // Register controllers
        app.controller("WizardController", ["$scope", "$element", "$compile", WizardController]);
    }
    function WizardController($scope, $element, $compile) {
        $scope.name = "Roel van Lisdonk";
    }
    return {
        setters:[],
        execute: function() {
            appName = 'app'; // Name of the angular application / module.
        }
    }
});
//# sourceMappingURL=app.js.map