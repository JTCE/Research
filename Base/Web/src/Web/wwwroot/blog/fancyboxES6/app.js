"use strict";
var appName = 'app'; // Name of the angular application / module.
function start() {
    console.log("started !!!!");
    registerAngularComponents();
    bootAngular();
}
exports.start = start;
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
    var template = "\n        <div ng-controller=\"WizardController\">\n            <span ng-bind=\"name\"></span>\n        </div>\n    ";
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
//# sourceMappingURL=app.js.map