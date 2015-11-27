var fs = require("q-io/fs");
"use strict";
var Validate = (function () {
    function Validate() {
    }
    /**
        * Determines if the given file is a html file.
        * Returns true, when path points to a file and the file extension === ".html"
        */
    Validate.prototype.isHtmlFile = function (path, stats) {
        var result = false;
        if (stats.node.isFile()) {
            var extension = fs.extension(path);
            if (extension === ".html") {
                result = true;
            }
        }
        return result;
    };
    return Validate;
})();
exports.Validate = Validate;
//# sourceMappingURL=Validate.js.map