System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function toSnakeCase(text) {
        return text.split(/(?=[A-Z])/).join("-").toLowerCase();
    }
    exports_1("toSnakeCase", toSnakeCase);
    return {
        setters:[],
        execute: function() {
        }
    }
});
