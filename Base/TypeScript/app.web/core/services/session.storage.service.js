var app;
(function (app) {
    var services;
    (function (services) {
        "use strict";
        var SessionStorageService = (function () {
            function SessionStorageService(storage) {
                this._storage = storage || sessionStorage;
            }
            SessionStorageService.prototype.getItem = function (key) {
                return JSON.parse(this._storage.getItem(key));
            };
            SessionStorageService.prototype.setItem = function (key, value) {
                this._storage.setItem(key, JSON.stringify(value));
            };
            return SessionStorageService;
        })();
        services.SessionStorageService = SessionStorageService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=session.storage.service.js.map