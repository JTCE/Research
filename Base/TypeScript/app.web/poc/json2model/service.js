/// <reference path="../../libraries/require/require.d.ts" />
//export var version = 8;
//
// https://github.com/mmanela/chutzpah/wiki/Running-RequireJS-unit-tests
console.log('RLI from source.');
////
var json2model;
(function (json2model) {
    var Service = (function () {
        function Service() {
        }
        Service.prototype.generate = function () {
            return 5;
        };
        return Service;
    })();
    json2model.Service = Service;
})(json2model || (json2model = {}));
console.log('test');
//exports.json2model = json2model;
//console.log(define);
//define(["require", "exports"], function (require, exports) {
//    exports.json2model = json2model;
//});
//# sourceMappingURL=service.js.map