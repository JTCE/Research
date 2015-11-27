
(function (hto) {
    /// <summary>
    /// Contains settings used throughout the whole application.
    /// signalr: "http://10.2.200.57:51570/signalr"
    /// signalr: "http://192.168.178.19:51570/signalr"
    /// signalr: "http://hto.azurewebsites.net/signalr"
    /// </summary>

    "use strict";

    var urls = {
        desktopTemplate: "Client/Desktop/desktop.html",
        loginTemplate: "Client/Core/Directives/Login/login.html",
        mobileTemplate: "Client/Mobile/mobile.html",
        signalr: "http://hto.azurewebsites.net/signalr"
    };

    hto.settings = {
        urls: urls
    };
}(hto));