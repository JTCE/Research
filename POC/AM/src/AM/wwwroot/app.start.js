System.register(["./login/login"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var login_1;
    //function renderLogin() {
    //    var element = document.createElement("div");
    //    var attribute = document.createAttribute("login");
    //    element.setAttributeNode(attribute);
    //    document.body.appendChild(element);
    //}
    function start() {
        console.log("App started!");
        // renderLogin();
        var l = login_1.login;
        debugger;
    }
    exports_1("start", start);
    return {
        setters:[
            function (login_1_1) {
                login_1 = login_1_1;
            }],
        execute: function() {
            start();
        }
    }
});
