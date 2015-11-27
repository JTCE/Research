var app;
(function (app) {
    "use strict";
    var Test1 = (function () {
        function Test1() {
        }
        Test1.prototype.DoSomeThing = function () {
        };
        return Test1;
    })();
    app.Test1 = Test1;
})(app || (app = {}));
//# sourceMappingURL=Test1.js.map