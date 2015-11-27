/// <reference path="../libraries/angular/angular.d.ts" />
var app;
(function (app) {
    var models;
    (function (models) {
        var dashboard;
        (function (dashboard) {
            "use strict";
            var Dashboard = (function () {
                function Dashboard(coreService) {
                    this.core = coreService;
                }
                Dashboard.prototype.activate = function () {
                    var self = this;
                    function showDataToUser(obj) {
                        debugger;
                        console.log(obj);
                    }
                    var data = { "title": "dit is een test" };
                    var request = new app.services.Request(data, self);
                    this.core.send(request).then(this.core.bind(self, showDataToUser));
                };
                return Dashboard;
            })();
            dashboard.Dashboard = Dashboard;
        })(dashboard = models.dashboard || (models.dashboard = {}));
    })(models = app.models || (app.models = {}));
})(app || (app = {}));
//# sourceMappingURL=dashboard.component.js.map