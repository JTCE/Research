/**
 * Notes:
 * More on typed css => https://www.npmjs.com/package/ts-style
 * Fetch service: https://github.com/ModuleLoader/es6-module-loader/blob/master/src/system-fetch.js
 * - Remove subscriptions, when removing compontent.
 * - Decrease style counter, when 0, remove styles from head.
 */
module app {
    var doc: Document = document;
    

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
}

module app.styles {
    export var colors = {
        dark: "rgba(126, 33, 109, 0.95)"
    };
}

module app.components.login {
    var colors = app.styles.colors;
    

    interface IStyles {
        loginContainer: am.css.IClass;
    }
    var styles: IStyles = {
        loginContainer: {
            backgroundColor: colors.dark
        }
    };

    // TODO: call css.process(styles) to generated scoped css classes.

    
}

module am.css {
    export interface IClass {
        backgroundColor?: string;
        name?: string; // Will be filled by the css.process(styles) function to generate scope dependend css classes.
        width?: string;
    }
}

module am.css {
    export function addStyles(styles: any): void {
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
}

module am.text {
    export function toSnakeCase(text: string): string {
        return text.split(/(?=[A-Z])/).join("-").toLowerCase();
    }
}