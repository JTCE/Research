var l = require("./tasks/Logger");
var l2 = require("./tasks/Logger");
var am;
(function (am) {
    var tasks;
    (function (tasks) {
        var test = new l.Logger();
        test.log("test");
        var test2 = new l2.Logger();
        test2.log("test2");
        var Templates = (function () {
            function Templates() {
            }
            return Templates;
        })();
        tasks.Templates = Templates;
    })(tasks = am.tasks || (am.tasks = {}));
})(am || (am = {}));
//var logger = new am.tasks.Logger();
//var templatesFilePath = __dirname + "\\" + "app\\templates.ts";
//var templates = new am.tasks.Templates(__dirname, templatesFilePath, logger);
//templates.update();
//# sourceMappingURL=app.js.map