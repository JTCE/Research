/// <reference path="service.ts" />
/// <reference path="../../libraries/require/require.d.ts" />
console.log('start 1');
var fs = require('fs');
// Read and eval library
var filedata = fs.readFileSync('./poc/json2model/service.js', 'utf8');
eval(filedata);
//import "json2model";
//require.config({
//    //baseUrl: '../' // commented for now
//});
//require(['poc/json2model/service'],
//    (main) => {
//        // code from window.onload
//        console.log('start 1');
//        console.log(main);
//    });
console.log('start 2');
//console.log(json2model);
//
console.log('start 3');
//console.log(s);
console.log('start 4');
// These are the tests.
describe("json2model.service.generate", function () {
    console.log('start 5');
    it("Should generate *.ts model files.", function () {
        console.log('start 6');
        var service = new json2model.Service();
        console.log('start 8');
        console.log(service);
        var result = service.generate();
        console.log(result);
        expect(5).toEqual(result);
        ///
        var a = 6;
    });
});
//# sourceMappingURL=service.tests.js.map