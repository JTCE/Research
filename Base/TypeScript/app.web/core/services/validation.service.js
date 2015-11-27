var app;
(function (app) {
    var services;
    (function (services) {
        "use strict";
        var ValidationService = (function () {
            function ValidationService() {
                // Matches YYYY-MM-ddThh:mm:ss.sssZ
                // Matches YYYY-MM-dd hh:mm:ss.sssZ
                // Matches YYYY-MM-ddThh:mm:ss
                // Matches YYYY-MM-dd hh:mm:ss
                // Matches YYYY-MM-ddThh:mm:ss.sss+02:00
                this.iso8601RegEx = /^(\d{4})-(\d{2})-(\d{2})(?:(T|\s)(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([\-+])(\d{2}):(\d{2}))?)?$/;
            }
            ValidationService.factory = function () {
                var service = function () { return new ValidationService(); };
                return service;
            };
            ValidationService.prototype.hasIso8601Match = function (value) {
                var result;
                if (this.isString(value)) {
                    result = value.match(this.iso8601RegEx);
                }
                return result;
            };
            ValidationService.prototype.hasValue = function (value) {
                return (!this.isUndefined(value) &&
                    !this.isNull(value));
            };
            ValidationService.prototype.isBoolean = function (value) {
                return (typeof value === "boolean");
            };
            ValidationService.prototype.isDate = function (value) {
                return (value instanceof Date &&
                    !isNaN(value.valueOf()));
            };
            ValidationService.prototype.isInteger = function (value) {
                return (this.isNumber(value) &&
                    isFinite(value) &&
                    Math.floor(value) === value);
            };
            ValidationService.prototype.isNativeType = function (value) {
                return (this.isBoolean(value) ||
                    this.isDate(value) ||
                    this.isNumber(value) ||
                    this.isString(value) ||
                    this.isSymbol(value));
            };
            ValidationService.prototype.isNull = function (value) {
                return (value === null);
            };
            ValidationService.prototype.isNumber = function (value) {
                return (typeof value === "number");
            };
            ValidationService.prototype.isString = function (value) {
                return (typeof value === "string");
            };
            ValidationService.prototype.isSymbol = function (value) {
                return (typeof value === "symbol");
            };
            ValidationService.prototype.isUndefined = function (value) {
                return (typeof value === "undefined");
            };
            return ValidationService;
        })();
        services.ValidationService = ValidationService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=validation.service.js.map