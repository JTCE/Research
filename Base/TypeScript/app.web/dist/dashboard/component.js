/// <reference path="../../libraries/angular/angular.d.ts" />
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
                        console.log(obj);
                    }
                    var request = app.settings.requests.dashboard.getData;
                    request.data = { "title": "dit is een test" };
                    request.vm = self;
                    self.core.send(request).then(self.core.bind(self, showDataToUser));
                };
                return Dashboard;
            })();
            dashboard.Dashboard = Dashboard;
        })(dashboard = models.dashboard || (models.dashboard = {}));
    })(models = app.models || (app.models = {}));
})(app || (app = {}));
//# sourceMappingURL=component.js.map