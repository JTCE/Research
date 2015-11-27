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
            IocService.prototype.register = function (key, factory) {
                if (this.factories[key]) {
                }
                else {
                    this.factories[key] = factory;
                }
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