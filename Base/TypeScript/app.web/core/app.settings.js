var app;
(function (app) {
    "use strict";
    var requests = {
        dashboard: {
            getData: {
                stub: "App.Models.DashboardStub.GetData",
                url: "enter_production_url_here"
            }
        }
    };
    app.settings = {
        requests: requests,
        stubServiceUrl: "StubService/HandleRequest",
        types: app.types
    };
})(app || (app = {}));
//# sourceMappingURL=app.settings.js.map