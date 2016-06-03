System.register(["../libraries/list/findIndexByItem"], function(exports_1) {
    var findIndexByItem_1;
    /**
     * This is the entry point for the application.
     * When this module is loaded the application will be started.
     */
    function start() {
        var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var result = findIndexByItem_1.findIndexByItem(3, list);
        showMessage(result.toString());
    }
    exports_1("start", start);
    function showMessage(text) {
        var element = document.getElementsByTagName("result")[0];
        element.textContent = text;
    }
    return {
        setters:[
            function (findIndexByItem_1_1) {
                findIndexByItem_1 = findIndexByItem_1_1;
            }],
        execute: function() {
            "use strict";
            // Start the application.
            start();
        }
    }
});
//# sourceMappingURL=app.js.map