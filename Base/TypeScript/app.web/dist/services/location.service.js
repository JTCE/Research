var app;
(function (app) {
    var services;
    (function (services) {
        var LocationService = (function () {
            function LocationService() {
            }
            LocationService.prototype.getUrl = function () {
                return window.location.href;
            };
            return LocationService;
        })();
        services.LocationService = LocationService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=location.service.js.map