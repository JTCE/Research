"use strict";
var Logger = (function () {
    function Logger() {
    }
    /**
        * Log the message to console if the log message is not "falsy".
        */
    Logger.prototype.log = function (message) {
        if (message) {
            console.log(message);
        }
    };
    return Logger;
})();
exports.Logger = Logger;
var test = new Logger();
test.log("test from module logger.");
//# sourceMappingURL=Logger.js.map