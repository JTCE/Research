module app.services {
    "use strict";

    export interface IIocService {
        /**
		* Register a type.
		*/
        register<T>(key: string, factory: () => T): void;

		/**
		* Get an instance of the given type.
		*/
        resolve<T>(key: string): T;
    }

    export class IocService implements IIocService {

        angularInjector: angular.auto.IInjectorService;
        angularModule: angular.IModule;
        factories: Array<any>;

        constructor(angularInjector: angular.auto.IInjectorService, angularModule: angular.IModule) {
            this.angularInjector = angularInjector;    
            this.angularModule = angularModule;
            this.factories = [];
        }

        register<T>(key: string, factory: () => T): void {
            if (this.factories[key]) {
                // TODO: Throw error, type already registered.
            } else {
                this.factories[key] = factory;
            }
        }
        
        resolve<T>(key: string): T {
            var factory = this.factories[key];

            return factory();
        }
    }
}  