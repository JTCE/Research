var app;
(function (app) {
    var models;
    (function (models) {
        "use strict";
        var Tooltip = (function () {
            function Tooltip() {
            }
            Tooltip.prototype.hide = function (e) {
                this.visible = false;
                e.stopPropagation();
            };
            ;
            Tooltip.prototype.toggle = function (e) {
                this.visible = !this.visible;
                e.stopPropagation();
            };
            ;
            return Tooltip;
        })();
        models.Tooltip = Tooltip;
    })(models = app.models || (app.models = {}));
})(app || (app = {}));
//# sourceMappingURL=tooltip.js.map