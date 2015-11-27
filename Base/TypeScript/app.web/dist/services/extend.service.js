var app;
(function (app) {
    var services;
    (function (services) {
        "use strict";
        var ExtendService = (function () {
            function ExtendService(ioc) {
                this.ioc = ioc;
                this.validate = this.ioc.resolve("app.services.IValidationService");
            }
            ExtendService.prototype.extend = function (objA, objB) {
                var key = null;
                var propB = null;
                var propA = null;
                for (key in objB) {
                    propA = objA[key];
                    propB = objB[key];
                    if (this.validate.hasValue(propB)) {
                        if (!this.validate.hasValue(propA)) {
                            objA[key] = propB;
                            continue;
                        }
                        if (this.validate.isNativeType(propB)) {
                            objA[key] = propB;
                            continue;
                        }
                        if (!Array.isArray(propB)) {
                            this.extend(propA, propB);
                            continue;
                        }
                        if (Array.isArray(propA) && Array.isArray(propB) && (typeof propA.itemType !== 'string')) {
                            objA[key] = propB;
                            continue;
                        }
                        if (Array.isArray(propA) && Array.isArray(propB) && (typeof propA.itemType === 'string')) {
                            var newArray = [];
                            for (var i = 0, length = propB.length; i < length; i += 1) {
                                var newItemA = this.ioc.resolve(propA.itemType);
                                this.extend(newItemA, propB[i]);
                                newArray.push(newItemA);
                            }
                            objA[key] = newArray;
                            continue;
                        }
                    }
                }
                return objA;
            };
            return ExtendService;
        })();
        services.ExtendService = ExtendService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=extend.service.js.map