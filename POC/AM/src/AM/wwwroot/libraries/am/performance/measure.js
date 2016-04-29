System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function measure(fn) {
        var t0 = performance.now();
        fn();
        var t1 = performance.now();
        console.log("Call took " + (t1 - t0) + " milliseconds.");
    }
    exports_1("measure", measure);
    return {
        setters:[],
        execute: function() {
        }
    }
});
