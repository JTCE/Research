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
var app;
(function (app) {
    app.resources = {
        loginEmail: "E-mailadres",
        loginForgotPassword: "Wachtwoord vergeten?",
        loginIntroduction: "Welkom op het Zorg van de Zaak online portaal. Als u zich eerder hebt aangemeld, kunt u met uw logingegevens toegang krijgen tot het portaal. Als u nog niet eerder aangemeld bent, kunt u (mits u hiertoe rechten heeft) zich aanmelden binnen het portaal. Volg daarvoor de instructies na Aanmelden.",
        loginPassword: "Wachtwoord"
    };
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
    function renderInfo(login) {
        var info = document.createElement("button");
        info.classList.add("info");
        login.appendChild(info);
    }
    function renderButtons(login) {
    }
    function renderEmail(login) {
        var label = document.createElement("div");
        label.classList.add("label");
        label.innerText = app.resources.loginEmail;
        login.appendChild(label);
        var textbox = document.createElement("input");
        textbox.classList.add("textbox");
        login.appendChild(textbox);
    }
    function renderIntroduction(login) {
        var introduction = document.createElement("div");
        introduction.innerText = app.resources.loginIntroduction;
        introduction.classList.add("introduction");
        login.appendChild(introduction);
    }
    function renderLogin(body) {
        var login = document.createElement("div");
        login.classList.add("login");
        renderLogo(login);
        renderInfo(login);
        renderIntroduction(login);
        renderEmail(login);
        renderPassword(login);
        renderButtons(login);
        body.appendChild(login);
    }
    function renderLogo(login) {
        var logo = document.createElement("div");
        logo.classList.add("logo");
        login.appendChild(logo);
    }
    function renderPassword(login) {
    }
    function start() {
        console.log("app started.");
        renderLogin(doc.body);
        // Create email label.
        //var emailLabel = document.createElement("div");
        //info.classList.add("info");
        //login.appendChild(info);   
    }
    start();
})(app || (app = {}));
