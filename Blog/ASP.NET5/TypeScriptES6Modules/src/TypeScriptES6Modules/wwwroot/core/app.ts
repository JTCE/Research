import { findIndexByItem } from "../libraries/list/findIndexByItem"

"use strict";

/**
 * This is the entry point for the application. 
 * When this module is loaded the application will be started.
 */
export function start(): void {

    var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var result = findIndexByItem(3, list);

    showMessage(result.toString());
}

function showMessage(text: string) {
    var element = document.getElementsByTagName("result")[0];
    element.textContent = text;
}

// Start the application.
start();