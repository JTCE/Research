var app;
(function (app) {
    var services;
    (function (services) {
        var CoreService = (function () {
            function CoreService(angularService, dataService, extendService, validationService) {
                this.angularService = angularService;
                this.dataService = dataService;
                this.extendService = extendService;
                this.validate = validationService;
            }
            CoreService.prototype.bind = function (self, fn) {
                return this.angularService.bind(self, fn);
            };
            CoreService.prototype.extend = function (objA, objB) {
                this.extendService.extend(objA, objB);
            };
            CoreService.prototype.send = function (request) {
                return this.dataService.send(request);
            };
            return CoreService;
        })();
        services.CoreService = CoreService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=core.service.js.map