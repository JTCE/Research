/// <reference path="../../libraries/es6/es6-promise.d.ts" />

module app.services {
    "use strict";

    export interface IDataService {
        /**
         * Send a request to the server.
         * When the current browser "url" contains "usestub", then the "stubservice" will be used.
         */
        send<VM>(request: IRequest): ng.IPromise<VM>;
    }

    export class DataService implements IDataService {
        extendService: app.services.IExtendService;
        httpService: angular.IHttpService;
        locationService: app.services.ILocationService;

        constructor(extendService: app.services.IExtendService, httpService: angular.IHttpService, locationService: app.services.ILocationService) {
            this.extendService = extendService;
            this.httpService = httpService;
            this.locationService = locationService;
        }

        getUrl(request: IRequest): string {
            var result = request.url;
            var url = this.locationService.getUrl();
            if (url.indexOf("usestub") >= 0) {
                result = app.settings.stubServiceUrl;
            }
            return result;
        }

        send<VM>(request: IRequest): ng.IPromise<VM> {
            var self = this;
            var data: any = request.data || {};
            data.stub = request.stub;
            
            function handle(response): VM  {
                return self.extendService.extend(request.vm, response.data);
            }

            var url = this.getUrl(request);
            return this.httpService.post<VM>(url, data).then(handle);
        }
    }

    export interface IRequest<> {
        /**
         * The data to send.
         */
        data?: Object;

        /**
         * The full description of the function that will be called, when the stubservice is used.
         */
        stub: string;

        /**
         * The url to send the request to.
         */
        url: string;

        /**
         * The received data, will be used to extend the given "ViewModel".
         */
        vm?: Object;
    }
} 