module app.models {
    "use strict";
    
    export class Breadcrumb {
        items: string[] = [];
        label = "";
    }
        
    export class Group {
        title = "";
        tiles: Tile[] = [];
    }

    export class Map {
        center = new app.models.MapCenter();
        defaults = new app.models.MapDefaults();
        markers: app.models.MapMarker[] = [];
    }

    export class MapCenter {
        
        // ## generated properties ##
        lat = 0.0;
        lng = 0.0;
        zoom = 0;
        // ## generated properties ##

    }

    export class MapDefaults {
        scrollWheelZoom = true;
    }

    export class MapMarker {
        draggable = true;
        focus = true;
        lat = 0.0;
        lng = 0.0;
        message = "";
    }

    export class Menu {
        items: app.models.MenuItem[] = [];
        label = "";
        visible = false;

        hide(e) {
            this.visible = false;
            e.stopPropagation();
        }

        toggle(e) {
            this.visible = !this.visible;
            e.stopPropagation();
        }

        toggleSubMenu(e, menuItem) {
            menuItem.subMenuVisible = !menuItem.subMenuVisible;
            e.stopPropagation();
        }
    }

    export class MenuItem {
        items: app.models.MenuItem[] = [];
        title = "";
    }

    export class Profile {
        label = "";
    }

    export class Tile {
        footer1 = "";
        footer2 = "";
        subtitle = "";
        title = "";
        tooltip = new app.models.Tooltip();
    }

    export class Tooltip {
        visible: boolean;

        hide(e) {
            this.visible = false;
            e.stopPropagation();
        }

        toggle(e) {
            this.visible = !this.visible;
            e.stopPropagation();
        }
    }

    export class LandingPage {
        breadcrumb = new app.models.Breadcrumb();
        groups: app.models.Group[] = [];
        map = new app.models.Map();
        menu = new app.models.Menu();
        profile = new app.models.Profile();
        useCustomStyles = false;

        hideTooltip(e, tooltip: app.models.Tooltip) {
            this.resetTooltips();
            tooltip.hide(e);
        }

        reset(e) {
            this.menu.hide(e);
        }

        resetTooltips() {
            this.groups[0].tiles.forEach(x => { x.tooltip.visible = false; });
        }

        showTooltip(e, tooltip: app.models.Tooltip) {
            this.resetTooltips();
            tooltip.toggle(e);
        }

        toggleStyles() {

            if (this.useCustomStyles) {
                this.map.center.lat = 52.067771;
                this.map.center.lng = 5.102268;
                this.map.markers[0].lat = 52.067771;
                this.map.markers[0].lng = 5.102268;
                this.map.markers[0].message = "Zorg van de Zaak";
            } else {
                this.map.center.lat = 53.069334;
                this.map.center.lng = 5.538259;
                this.map.markers[0].lat = 53.069334;
                this.map.markers[0].lng = 5.538259;
                this.map.markers[0].message = "De vormfabriek";
            }

            this.useCustomStyles = !this.useCustomStyles;
        }   
    }
} 
