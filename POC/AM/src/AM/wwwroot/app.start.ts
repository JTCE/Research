import { login } from "./login/login"

//function renderLogin() {
//    var element = document.createElement("div");
//    var attribute = document.createAttribute("login");
//    element.setAttributeNode(attribute);
//    document.body.appendChild(element);
//}

export function start() {
    console.log("App started!");
    // renderLogin();
    var l = login;
    debugger; 
}

start();