module app.services {
    "use strict";

    export interface ILocationService {

        /**
         * Get the full path of the browser url.
         */
        getUrl(): string;
    }

    export class LocationService implements ILocationService {
        
        constructor() {
            
        }

        getUrl(): string {
            return window.location.href;
        }
    }
} 