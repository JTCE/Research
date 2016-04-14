/**
 * Notes:
 * More on typed css => https://www.npmjs.com/package/ts-style
 */
var app;
(function (app) {
    var doc = document;
    var stringify = JSON.stringify;
    var colors = {
        dark: "rgba(126, 33, 109, 0.95)"
    };
    var styles = {
        loginContainer: {
            backgroundColor: colors.dark
        }
    };
    function addStyles(element, styles) {
        var content = "";
        for (var name in styles) {
            if (styles.hasOwnProperty(name)) {
                content += "." + name + " {" + "";
                content += " {";
            }
        }
        var stylesElement = document.createElement("styles");
        //stylesElement.innerText = content;
        //element.appendChild(stylesElement);
    }
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
