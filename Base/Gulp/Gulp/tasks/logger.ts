
"use strict";

export interface ILogger {
    log(message: any): void;
}

export class Logger implements ILogger {
    /**
        * Log the message to console if the log message is not "falsy".
        */
    log(message: any): void {
        if (message) {
            console.log(message);
        }
    }
}

var test = new Logger();
test.log("test from module logger");
