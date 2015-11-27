var app;
(function (app) {
    var services;
    (function (services) {
        "use strict";
        var IocService = (function () {
            function IocService(angularInjector, angularModule) {
                this.angularInjector = angularInjector;
                this.angularModule = angularModule;
                this.factories = [];
            }
            IocService.prototype.getComponentName = function (key) {
                return "Dashboard";
            };
            IocService.prototype.registerViewModel = function (key, factory) {
                this.factories[key] = factory;
            };
            IocService.prototype.registerComponent = function (key, templateUrl, createInstance, factory) {
                var self = this;
                self.registerViewModel(key, factory);
                this.angularModule.directive('app' + key, [function () {
                    function link(scope, element, attrs) {
                        if (createInstance) {
                            scope["vm"] = self.resolve(key);
                        }
                        var vm = scope["vm"];
                        vm.attrs = attrs;
                        vm.element = element;
                        vm.scope = scope;
                        vm.activate();
                    }
                    var directive = {
                        link: link,
                        restrict: "EA",
                        scope: {
                            vm: "="
                        }
                    };
                    if (templateUrl) {
                        directive["templateUrl"] = templateUrl;
                    }
                    else {
                        directive["transclude"] = true;
                    }
                    return directive;
                }]);
            };
            IocService.prototype.registerService = function (key, factory) {
                var factoryResult = factory();
                this.factories[key] = function () {
                    return factoryResult;
                };
            };
            IocService.prototype.resolve = function (key) {
                var factory = this.factories[key];
                return factory();
            };
            return IocService;
        })();
        services.IocService = IocService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=ioc.service.js.map