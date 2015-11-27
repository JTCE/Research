var app;
(function (app) {
    var services;
    (function (services) {
        "use strict";
        var ExtendService = (function () {
            function ExtendService(validate) {
                this.validate = validate;
            }
            ExtendService.prototype.extend = function (objA, objB) {
                var key = null;
                for (key in objB) {
                    objA[key] = this.getItem(objA[key], objB[key]);
                }
                return objA;
            };
            ExtendService.prototype.executeTypeConversions = function (value) {
                var result = value;
                var matches = this.validate.hasIso8601Match(value);
                if (matches) {
                    result = this.executeIso8601TypeConversion(value, matches);
                }
                return result;
            };
            ExtendService.prototype.executeIso8601TypeConversion = function (value, matches) {
                var result = value;
                var year = 0;
                var month = 0;
                var day = 0;
                var hours = 0;
                var minutes = 0;
                var seconds = 0;
                var milliseconds = 0;
                year = parseInt(matches[1], 10);
                month = parseInt(matches[2], 10);
                day = parseInt(matches[3], 10);
                if (this.validate.isInteger(year) &&
                    this.validate.isInteger(month) &&
                    this.validate.isInteger(day)) {
                    result = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
                }
                hours = parseInt(matches[5], 10);
                if (this.validate.isInteger(hours)) {
                    result.setHours(hours);
                }
                minutes = parseInt(matches[6], 10);
                if (this.validate.isInteger(minutes)) {
                    result.setMinutes(minutes);
                }
                seconds = parseInt(matches[7], 10);
                if (this.validate.isInteger(seconds)) {
                    result.setSeconds(seconds);
                }
                var millisecondsMatch = matches[8];
                if (millisecondsMatch) {
                    milliseconds = parseInt(millisecondsMatch.substring(1), 10);
                    if (this.validate.isInteger(milliseconds)) {
                        result.setMilliseconds(milliseconds);
                    }
                }
                return result;
            };
            ExtendService.prototype.getArray = function (propB) {
                var newArrayA = [];
                for (var i = 0, length = propB.length; i < length; i += 1) {
                    var itemB = propB[i];
                    var newItemA = this.getItem(null, propB[i]);
                    newArrayA.push(newItemA);
                }
                return newArrayA;
            };
            ExtendService.prototype.getItem = function (propA, propB) {
                if (this.validate.hasValue(propB)) {
                    if (this.validate.isNativeType(propB)) {
                        return this.executeTypeConversions(propB);
                    }
                    if (!Array.isArray(propB)) {
                        if (!this.validate.hasValue(propA)) {
                            propA = {};
                        }
                        this.extend(propA, propB);
                        return propA;
                    }
                    if (Array.isArray(propB)) {
                        return this.getArray(propB);
                    }
                }
            };
            return ExtendService;
        })();
        services.ExtendService = ExtendService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=extend.service.js.map