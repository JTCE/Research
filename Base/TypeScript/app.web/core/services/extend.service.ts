module app.services {
    "use strict";

    export interface IExtendService {
        /**
         * Properties from object B will be copied to object A.
         * 
         * - When property "B" is "null" or "undefined" or null, it is NOT copied.
         * - When property "B" is a "native" type (boolean, date, number, string, symbol), it will copied from "B" to "A".
         * - When property "B" is a "ISO 8601 string" it will be converted to a date object and then copied from "B" to "A".
         * - When property "B" is an "object" and NOT an "array", property "B" will be extended on property "A".
         *      - When "A" has no value, "A" is first set to an empty object (= {}).
         * - When property "B" is an "array", the following rules apply:
         *      - "A" is set to [] and then foreach item in "B":
         *          - A new object is created
         *          - When the array "B" contains a property "itemType", the new object will be of the type contained in "itemType"
         *          - The new object is extended with the corresponding item in array "B"
         */
        extend<A extends Object, B extends Object>(objA: A, objB: B);
    }

    export class ExtendService implements IExtendService {

        constructor(public validate: IValidationService) {
        }

        extend<A extends Object, B extends Object>(objA: A, objB: B) {
            var key = null;
            for (key in objB) {
                objA[key] = this.getItem(objA[key], objB[key]);
            }
            return objA;
        }

        executeTypeConversions(value: any): any {
            var result = value;
            var matches = this.validate.hasIso8601Match(value);
            if (matches) {
                result = this.executeIso8601TypeConversion(value, matches);
            }

            return result;
        }

        executeIso8601TypeConversion(value: any, matches: Array<any>): any {
            var result = value;
            var year = 0;
            var month = 0;
            var day = 0;
            var hours = 0;
            var minutes = 0;
            var seconds = 0;
            var milliseconds = 0;

            year = parseInt(matches[1], 10);
            month = parseInt(matches[2], 10);
            day = parseInt(matches[3], 10);

            if (
                this.validate.isInteger(year) &&
                this.validate.isInteger(month) &&
                this.validate.isInteger(day)
                ) {
                result = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
            }

            hours = parseInt(matches[5], 10);
            if (this.validate.isInteger(hours)) {
                result.setHours(hours);
            }

            minutes = parseInt(matches[6], 10);
            if (this.validate.isInteger(minutes)) {
                result.setMinutes(minutes);
            }

            seconds = parseInt(matches[7], 10);
            if (this.validate.isInteger(seconds)) {
                result.setSeconds(seconds);
            }

            var millisecondsMatch = matches[8];
            if (millisecondsMatch) {
                milliseconds = parseInt(millisecondsMatch.substring(1), 10);
                if (this.validate.isInteger(milliseconds)) {
                    result.setMilliseconds(milliseconds);
                }
            }

            return result;
        }

        getArray(propB: Array<any>): Array<any> {
            var newArrayA = [];
            for (var i = 0, length = propB.length; i < length; i += 1) {
                var itemB = propB[i];
                var newItemA = this.getItem(null, propB[i])
                newArrayA.push(newItemA);
            }
            return newArrayA;
        }

        getItem(propA: any, propB: any): any {
            if (this.validate.hasValue(propB)) {

                if (this.validate.isNativeType(propB)) {
                    return this.executeTypeConversions(propB);
                }

                if (!Array.isArray(propB)) {
                    if (!this.validate.hasValue(propA)) {
                        propA = {};
                    }
                    this.extend(propA, propB);
                    return propA;
                }

                if (Array.isArray(propB)) {
                    return this.getArray(propB);
                }
            }
        }
    }
} 

