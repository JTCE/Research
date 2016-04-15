/**
 * Notes:
 * More on typed css => https://www.npmjs.com/package/ts-style
 * Fetch service: https://github.com/ModuleLoader/es6-module-loader/blob/master/src/system-fetch.js
 * - Remove subscriptions, when removing compontent.
 * - Decrease style counter, when 0, remove styles from head.
 */
var app;
(function (app) {
    var doc = document;
    function start() {
        console.log("app started.");
        // Create styles
        var div = document.createElement("div");
        // Show message.
        var div = document.createElement("div");
        div.innerText = "Hello world!";
        doc.body.appendChild(div);
    }
    start();
})(app || (app = {}));
var app;
(function (app) {
    var styles;
    (function (styles) {
        styles.colors = {
            dark: "rgba(126, 33, 109, 0.95)"
        };
    })(styles = app.styles || (app.styles = {}));
})(app || (app = {}));
var app;
(function (app) {
    var components;
    (function (components) {
        var login;
        (function (login) {
            var colors = app.styles.colors;
            var styles = {
                loginContainer: {
                    backgroundColor: colors.dark
                }
            };
        })(login = components.login || (components.login = {}));
    })(components = app.components || (app.components = {}));
})(app || (app = {}));
var am;
(function (am) {
    var css;
    (function (css) {
        function addStyles(styles) {
            var content = "";
            // Add to header, check if styles exists based on id?
            for (var name in styles) {
                if (styles.hasOwnProperty(name)) {
                    content += "." + name + " {" + "";
                    content += " {";
                }
            }
            var stylesElement = document.createElement("styles");
            //stylesElement.innerText = content;
            //element.appendChild(stylesElement);
            // TODO: add overwrites 
        }
        css.addStyles = addStyles;
    })(css = am.css || (am.css = {}));
})(am || (am = {}));
var am;
(function (am) {
    var text;
    (function (text_1) {
        function toSnakeCase(text) {
            return text.split(/(?=[A-Z])/).join("-").toLowerCase();
        }
        text_1.toSnakeCase = toSnakeCase;
    })(text = am.text || (am.text = {}));
})(am || (am = {}));
