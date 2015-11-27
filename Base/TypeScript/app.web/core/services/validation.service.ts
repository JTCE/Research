module app.services {
    "use strict";

    export interface IValidationService {

        /**
         * Check if given value is NOT "undefined" or "null".
         */
        hasValue(obj: any): boolean;

        /**
         * Check if given value contains a ISO 8601 string.
         * @returns {Array} matches of the iso8601RegEx.
         */
        hasIso8601Match(value: any): Array<any>;

        /**
         * Check if the value is a boolean.
         */
        isBoolean(value: any): boolean;

        /**
         * Check if the type of the given value is of type "Date".
         */
        isDate(value: any): boolean;

        /**
         * Check if the value is an "integer".
         */
        isInteger(value: any): boolean;

        /**
         * Check if the type of the given value is a native type (e.g. "boolean", "Date", "number", "symbol" or "string")
         */
        isNativeType(value: any): boolean;

        /**
         * Check if the value is "null";
         */
        isNull(value: any): boolean;

        /**
         * Check if the value is a "symbol".
         */
        isSymbol(value: any): boolean;

        /**
         * Check if the value is a "string".
         */
        isString(value: any): boolean;

        /**
         * Check if the value is "undefined".
         */
        isUndefined(value: any): boolean;
    }

    export class ValidationService implements IValidationService {

        // Matches YYYY-MM-ddThh:mm:ss.sssZ
        // Matches YYYY-MM-dd hh:mm:ss.sssZ
        // Matches YYYY-MM-ddThh:mm:ss
        // Matches YYYY-MM-dd hh:mm:ss
        // Matches YYYY-MM-ddThh:mm:ss.sss+02:00
        iso8601RegEx = /^(\d{4})-(\d{2})-(\d{2})(?:(T|\s)(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([\-+])(\d{2}):(\d{2}))?)?$/;

        constructor() {

        }

        public static factory() {
            var service = () => { return new ValidationService(); };
            return service;
        }

        public hasIso8601Match(value: any): Array<any> {
            var result;

            if (this.isString(value)) {
                result = value.match(this.iso8601RegEx);
            }

            return result;
        }

        public hasValue(value: any): boolean {
            return (
                !this.isUndefined(value) &&
                !this.isNull(value)
                );
        }

        public isBoolean(value: any): boolean {
            return (typeof value === "boolean");
        }

        public isDate(value: any): boolean {
            return (
                value instanceof Date &&
                !isNaN(value.valueOf())
                );
        }

        public isInteger(value: any): boolean {
            return (this.isNumber(value) &&
                isFinite(value) &&
                Math.floor(value) === value);
        }

        public isNativeType(value: any): boolean {
            return (
                this.isBoolean(value) ||
                this.isDate(value) ||
                this.isNumber(value) ||
                this.isString(value) ||
                this.isSymbol(value)
                );
        }

        public isNull(value: any): boolean {
            return (value === null);
        }

        public isNumber(value: any): boolean {
            return (typeof value === "number");
        }

        public isString(value: any): boolean {
            return (typeof value === "string");
        }

        public isSymbol(value: any): boolean {
            return (typeof value === "symbol");
        }

        public isUndefined(value: any): boolean {
            return (typeof value === "undefined");
        }
    }
} 