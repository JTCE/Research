var app;
(function (app) {
    "use strict";
    var requests = {
        dashboard: {
            getData: {
                stub: "app.web.dashboard.Stub.GetData",
                url: "StubService/HandleRequest"
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