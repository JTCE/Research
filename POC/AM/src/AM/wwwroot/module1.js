System.register(["module1_1", "module1_2"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var module1_1_1, module1_2_1;
    function runModule1() {
        console.log("Run module 1.");
        module1_1_1.runModule1_1();
        module1_2_1.runModule1_2();
    }
    exports_1("runModule1", runModule1);
    return {
        setters:[
            function (module1_1_1_1) {
                module1_1_1 = module1_1_1_1;
            },
            function (module1_2_1_1) {
                module1_2_1 = module1_2_1_1;
            }],
        execute: function() {
        }
    }
});
