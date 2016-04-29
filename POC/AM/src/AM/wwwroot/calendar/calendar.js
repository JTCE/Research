System.register(['./libraries/am/performance/measure'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var measure_1;
    function calendar() {
        console.log("calendar loaded.");
        measure_1.default.measure(renderCalendar);
    }
    exports_1("calendar", calendar);
    function renderCalendar() {
        var total = 1000;
        var children = new Array(total);
        for (var i = 0; i < total; i++) {
            children[i] = {
                name: "span"
            };
        }
        render(children);
    }
    function render(children) {
    }
    return {
        setters:[
            function (measure_1_1) {
                measure_1 = measure_1_1;
            }],
        execute: function() {
        }
    }
});
