module app {
    "use strict";

    var appModule = angular.module("app", ["leaflet-directive"]);

    appModule.controller("DraggingMarkersController", [ '$scope', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 52.067771,
                lng: 5.102268,
                zoom: 15
            },
            defaults: {
                scrollWheelZoom: true
            },
            markers: {
                ZvdZ: {
                    lat: 52.067771,
                    lng: 5.102268,
                    message: "Zorg van de Zaak",
                    focus: true,
                    draggable: true
                }
            }
        });
    }]);
} 