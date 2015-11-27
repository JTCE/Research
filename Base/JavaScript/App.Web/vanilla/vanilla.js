
var app;
(function (app) {
    
    "use strict";
    var Widget = (function () {
        function Widget(name) {
            this.name = name;
        }

        Widget.prototype.testEvent = function () {
            console.log(this.name);
        };
        return Widget;
    })();
    app.Widget = Widget;

    var w = new app.Widget("Roel");
    var events = []

    events.push(w.testEvent);

    w = null;

    var e = events[0];
    e();

})(app || (app = {}));


// Angular module.
(function () {
    "use strict";

     

}());
