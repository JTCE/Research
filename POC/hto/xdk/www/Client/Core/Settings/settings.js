
(function (hto) {
    /// <summary>
    /// Contains settings used throughout the whole application.
    /// </summary>

    "use strict";

    var urls = {
        authenticate: "Server/Authentication/Authenticate",
        desktopTemplate: "Client/Desktop/desktop.html",
        getDesktopData: "Server/Desktop/GetData",
        getMobileData: "Server/Mobile/GetData",
        loginTemplate: "Client/Core/Directives/Login/login.html",
        mobileTemplate: "Client/Mobile/mobile.html",
        stubService: "Server/Stub/HandleRequest"
    };

    var handlers = {
        authenticate: {
            stubDataHandler: "HTO.Web.Server.Stub.Authentication.Authenticate",
            url: urls.authenticate
        },
        getDesktopData: {
            stubDataHandler: "HTO.Web.Server.Stub.Desktop.GetData",
            url: urls.getDesktopData
        },
        getMobileData: {
                stubDataHandler: "HTO.Web.Server.Stub.Mobile.GetData",
                url: urls.getMobileData
        }
    };

    hto.settings = {
        handlers: handlers,
        urls: urls,
        useAntiForgeryToken: true /* When turned on, all postdata will use an anti forgery token. */
    };
}(hto));