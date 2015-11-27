var app;
(function (app) {
    var models;
    (function (models) {
        "use strict";
        var Breadcrumb = (function () {
            function Breadcrumb() {
                this.items = [];
                this.label = "";
            }
            return Breadcrumb;
        })();
        models.Breadcrumb = Breadcrumb;
        var Group = (function () {
            function Group() {
                this.title = "";
                this.tiles = [];
            }
            return Group;
        })();
        models.Group = Group;
        var Map = (function () {
            function Map() {
                this.center = new app.models.MapCenter();
                this.defaults = new app.models.MapDefaults();
                this.markers = [];
            }
            return Map;
        })();
        models.Map = Map;
        var MapCenter = (function () {
            function MapCenter() {
                // ## generated properties ##
                this.lat = 0.0;
                this.lng = 0.0;
                this.zoom = 0;
            }
            return MapCenter;
        })();
        models.MapCenter = MapCenter;
        var MapDefaults = (function () {
            function MapDefaults() {
                this.scrollWheelZoom = true;
            }
            return MapDefaults;
        })();
        models.MapDefaults = MapDefaults;
        var MapMarker = (function () {
            function MapMarker() {
                this.draggable = true;
                this.focus = true;
                this.lat = 0.0;
                this.lng = 0.0;
                this.message = "";
            }
            return MapMarker;
        })();
        models.MapMarker = MapMarker;
        var Menu = (function () {
            function Menu() {
                this.items = [];
                this.label = "";
                this.visible = false;
            }
            Menu.prototype.hide = function (e) {
                this.visible = false;
                e.stopPropagation();
            };
            Menu.prototype.toggle = function (e) {
                this.visible = !this.visible;
                e.stopPropagation();
            };
            Menu.prototype.toggleSubMenu = function (e, menuItem) {
                menuItem.subMenuVisible = !menuItem.subMenuVisible;
                e.stopPropagation();
            };
            return Menu;
        })();
        models.Menu = Menu;
        var MenuItem = (function () {
            function MenuItem() {
                this.items = [];
                this.title = "";
            }
            return MenuItem;
        })();
        models.MenuItem = MenuItem;
        var Profile = (function () {
            function Profile() {
                this.label = "";
            }
            return Profile;
        })();
        models.Profile = Profile;
        var Tile = (function () {
            function Tile() {
                this.footer1 = "";
                this.footer2 = "";
                this.subtitle = "";
                this.title = "";
                this.tooltip = new app.models.Tooltip();
            }
            return Tile;
        })();
        models.Tile = Tile;
        var Tooltip = (function () {
            function Tooltip() {
            }
            Tooltip.prototype.hide = function (e) {
                this.visible = false;
                e.stopPropagation();
            };
            Tooltip.prototype.toggle = function (e) {
                this.visible = !this.visible;
                e.stopPropagation();
            };
            return Tooltip;
        })();
        models.Tooltip = Tooltip;
        var LandingPage = (function () {
            function LandingPage() {
                this.breadcrumb = new app.models.Breadcrumb();
                this.groups = [];
                this.map = new app.models.Map();
                this.menu = new app.models.Menu();
                this.profile = new app.models.Profile();
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
//# sourceMappingURL=employee.model.js.map