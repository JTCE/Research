// Adjust loader so .html will be loaded and converted to json.
// Adjust loader so .css will be loaded and converted to json.
// Create a gulp task that creates bundles foreach component including html and css.
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function start() {
        console.log("App started!");
        // renderLogin();
    }
    exports_1("start", start);
    return {
        setters:[],
        execute: function() {
            start();
        }
    }
});
