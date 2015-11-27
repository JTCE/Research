module app {
    "use strict";

    var requests = {
            dashboard: {
                getData:     {
                    stub: "App.Models.DashboardStub.GetData",
                    url: "enter_production_url_here"
                }
            }
    };
    
    export var settings = {
        requests: requests,
        stubServiceUrl: "StubService/HandleRequest",
        types: types
    };
} 