var app;
(function (app) {
    var services;
    (function (services) {
        var ValidationService = (function () {
            function ValidationService() {
            }
            ValidationService.prototype.hasValue = function (obj) {
                return (typeof obj !== "undefined" && obj !== null);
            };
            ValidationService.prototype.isDate = function (value) {
                return (value instanceof Date && !isNaN(value.valueOf()));
            };
            ValidationService.prototype.isNativeType = function (value) {
                return (value !== "object") || (value instanceof Date && !isNaN(value.valueOf()));
            };
            return ValidationService;
        })();
        services.ValidationService = ValidationService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=validation.service.js.map