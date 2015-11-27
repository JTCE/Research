/// <reference path="../../libraries/es6/es6-promise.d.ts" />
var app;
(function (app) {
    var services;
    (function (services) {
        "use strict";
        var DataService = (function () {
            function DataService(extendService, httpService, locationService) {
                this.extendService = extendService;
                this.httpService = httpService;
                this.locationService = locationService;
            }
            DataService.prototype.getUrl = function (request) {
                var result = request.url;
                var url = this.locationService.getUrl();
                if (url.indexOf("usestub") >= 0) {
                    result = app.settings.stubServiceUrl;
                }
                return result;
            };
            DataService.prototype.send = function (request) {
                var self = this;
                var data = request.data || {};
                data.stub = request.stub;
                function handle(response) {
                    return self.extendService.extend(request.vm, response.data);
                }
                var url = this.getUrl(request);
                return this.httpService.post(url, data).then(handle);
            };
            return DataService;
        })();
        services.DataService = DataService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=data.service.js.map