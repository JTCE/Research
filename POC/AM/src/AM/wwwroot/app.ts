
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

module app {
    export var resources = {
        loginEmail: "E-mailadres",
        loginForgotPassword: "Wachtwoord vergeten?",
        loginIntroduction: "Welkom op het Zorg van de Zaak online portaal. Als u zich eerder hebt aangemeld, kunt u met uw logingegevens toegang krijgen tot het portaal. Als u nog niet eerder aangemeld bent, kunt u (mits u hiertoe rechten heeft) zich aanmelden binnen het portaal. Volg daarvoor de instructies na Aanmelden.",
        loginPassword: "Wachtwoord"
    };
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


/**
 * Notes:
 * More on typed css => https://www.npmjs.com/package/ts-style
 * Fetch service: https://github.com/ModuleLoader/es6-module-loader/blob/master/src/system-fetch.js
 * - Remove subscriptions, when removing compontent.
 * - Decrease style counter, when 0, remove styles from head.
 */
module app {
    var doc: Document = document;

    function renderInfo(login: HTMLDivElement) {
        var info = document.createElement("button");
        info.classList.add("info");
        login.appendChild(info);
    }

    function renderButtons(login: HTMLDivElement) {
    }

    function renderEmail(login: HTMLDivElement) {
        var label = document.createElement("div");
        label.classList.add("label");
        label.innerText = app.resources.loginEmail;
        login.appendChild(label);

        var textbox = document.createElement("input");
        textbox.classList.add("textbox");
        login.appendChild(textbox);
    }
    
    function renderIntroduction(login: HTMLDivElement) {
        var introduction = document.createElement("div");
        introduction.innerText = app.resources.loginIntroduction;
        introduction.classList.add("introduction");
        login.appendChild(introduction);
    }

    function renderLogin(body: HTMLElement) {
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

    function renderLogo(login: HTMLDivElement) {
        var logo = document.createElement("div");
        logo.classList.add("logo");
        login.appendChild(logo);
    }

    function renderPassword(login: HTMLDivElement) {
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
}