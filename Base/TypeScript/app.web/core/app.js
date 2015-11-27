/// <reference path="../libraries/angular/angular.d.ts" />
/// <reference path="../libraries/es6/es6-promise.d.ts" />
var app;
(function (app) {
    "use strict";
    var appModule = angular.module("app", ["kendo.directives"]);
    var App = (function () {
        function App() {
        }
        App.prototype.registerTypes = function () {
            var _this = this;
            this.ioc.registerService("ng.IAngularStatic", function () { return angular; });
            this.ioc.registerService("angular.IHttpService", function () { return _this.injector.get("$http"); });
            this.ioc.registerService("angular.IQService", function () { return _this.injector.get("$q"); });
            this.ioc.registerService("app.services.ILocationService", function () { return new app.services.LocationService(); });
            this.ioc.registerService("app.services.IValidationService", function () { return new app.services.ValidationService(); });
            this.ioc.registerService("app.services.IExtendService", function () { return new app.services.ExtendService(_this.ioc); });
            this.ioc.registerService("app.services.IDataService", function () {
                return new app.services.DataService(_this.ioc.resolve("app.services.IExtendService"), _this.ioc.resolve("angular.IHttpService"), _this.ioc.resolve("app.services.ILocationService"));
            });
            //this.ioc.registerComponent<app.models.dashboard.Dashboard>("app.models.dashboard.Dashboard", "/dashboard/view.html", true,() => {
            //    return new app.models.dashboard.Dashboard(
            //        this.ioc.resolve<app.services.ICoreService>("app.services.ICoreService")
            //    );
            //});
            this.ioc.registerService("app.services.ICoreService", function () {
                return new app.services.CoreService(_this.ioc.resolve("ng.IAngularStatic"), _this.ioc.resolve("app.services.IDataService"), _this.ioc.resolve("app.services.IExtendService"), _this.ioc.resolve("app.services.IValidationService"));
            });
        };
        App.prototype.start = function () {
            var self = this;
            this.injector = angular.injector(["ng"]);
            this.ioc = new app.services.IocService(this.injector, appModule);
            this.registerTypes();
        };
        return App;
    })();
    var a = new App();
    a.start();
})(app || (app = {}));
//# sourceMappingURL=app.js.map