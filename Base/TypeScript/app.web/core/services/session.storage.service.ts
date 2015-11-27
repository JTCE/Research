module app.services {
    "use strict";

    export interface ISessionStorageService {

        /**
         * Add a value to the session storage.
         * The value is serialized to a string, to store in session storage.
         */
        setItem(key: string, value: any);

        /**
         * The value is deserialized to object from session storage.
         */
        getItem(key: string): any;
    }

    export class SessionStorageService implements ISessionStorageService {
        
        _storage: Storage;

        constructor(storage: Storage) {
            this._storage = storage || sessionStorage;
        }

        getItem(key: string): any {
            return JSON.parse(this._storage.getItem(key));
        }

        setItem(key: string, value: any) {
            this._storage.setItem(key, JSON.stringify(value));
        }
    }
} 