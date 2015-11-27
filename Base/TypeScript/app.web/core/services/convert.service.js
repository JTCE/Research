var app;
(function (app) {
    var services;
    (function (services) {
        "use strict";
        var ConvertService = (function () {
            function ConvertService() {
            }
            ConvertService.prototype.convertToNumber = function (s) {
                var result = 0;
                for (var i = 0, length = s.length; i < length; i++) {
                    result += s.charCodeAt(i);
                }
                return result;
            };
            return ConvertService;
        })();
        services.ConvertService = ConvertService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=convert.service.js.map