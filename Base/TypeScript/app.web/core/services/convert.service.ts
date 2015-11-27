module app.services {
    "use strict";

    export interface IConvertService {

        /*
         * Convert a string to a number by summing the "char codes".
         **/
        convertToNumber(s: string): number;
    }

    export class ConvertService implements IConvertService {

        constructor() {

        }

        public convertToNumber(s: string): number {
            var result = 0;
            for (var i = 0, length = s.length; i < length; i++) {
                result += s.charCodeAt(i);
            }
            return result;
        }
    }
}
