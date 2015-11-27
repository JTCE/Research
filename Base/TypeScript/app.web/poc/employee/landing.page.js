var app;
(function (app) {
    var models;
    (function (models) {
        "use strict";
        var LandingPage = (function () {
            function LandingPage() {
                this.breadcrumb = new app.models.Breadcrumb();
                this.groups = [];
                this.map = new app.models.Map();
                this.menu = new app.models.Menu();
                this.profiel = {
                    label: "Mijn profiel"
                };
                this.useCustomStyles = false;
            }
            LandingPage.prototype.hideTooltip = function (e, tooltip) {
                this.resetTooltips();
                tooltip.hide(e);
            };
            LandingPage.prototype.reset = function (e) {
                this.menu.hide(e);
            };
            LandingPage.prototype.resetTooltips = function () {
                this.groups[0].tiles.forEach(function (x) { x.tooltip.visible = false; });
            };
            LandingPage.prototype.showTooltip = function (e, tooltip) {
                this.resetTooltips();
                tooltip.toggle(e);
            };
            LandingPage.prototype.toggleStyles = function () {
                if (this.useCustomStyles) {
                    this.map.center.lat = 52.067771;
                    this.map.center.lng = 5.102268;
                    this.map.markers[0].lat = 52.067771;
                    this.map.markers[0].lng = 5.102268;
                    this.map.markers[0].message = "Zorg van de Zaak";
                }
                else {
                    this.map.center.lat = 53.069334;
                    this.map.center.lng = 5.538259;
                    this.map.markers[0].lat = 53.069334;
                    this.map.markers[0].lng = 5.538259;
                    this.map.markers[0].message = "De vormfabriek";
                }
                this.useCustomStyles = !this.useCustomStyles;
            };
            return LandingPage;
        })();
        models.LandingPage = LandingPage;
    })(models = app.models || (app.models = {}));
})(app || (app = {}));
//# sourceMappingURL=landing.page.js.map