
(function (hto) {
    /// <summary>
    /// Contains settings used only, when application is deployed as app.
    /// signalr: "http://10.2.200.57:51570/signalr"
    /// signalr: "http://192.168.178.19:51570/signalr"
    /// signalr: "http://hto.azurewebsites.net/signalr"
    /// </summary>

    "use strict";

    var urls = {
        loginTemplate: "Core/Directives/Login/login.html",
        mobileTemplate: "Mobile/mobile.html",
        signalr: "http://hto.azurewebsites.net/signalr"
    };

    hto.settings = {
        urls: urls
    };
}(hto));