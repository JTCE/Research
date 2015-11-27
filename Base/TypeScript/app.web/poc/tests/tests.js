var tests;
(function (tests) {
    describe("Test basic javascript code.", function () {
        it("Call execute.", function () {
            var t0 = performance.now();
            // var total = 1000000;
            //var a = createArray(total);
            //var b = shallowCopyObject(o);
            //var b = shallowCopyArrayWithSlice(a);
            //var a = createArrayWithPush(total);
            //var a = createArrayWithPush(total);
            //var o1 = createObject(total);
            //var o2 = shallowCopyObject(o1);
            //var a1 = createArrayWithHoles(total);
            //var a2 = shallowCopyArrayBasedOnKeys(a);
            var t1 = performance.now();
            console.log("Call to exectue took " + (t1 - t0) + " milliseconds.");
            expect(true).toBeTruthy();
        });
    });
    /*
     * Create a shallow copy of an array.
     * Input: array with length 1.000.000, Executiontime: 5ms.
     */
    function shallowCopyArray(a) {
        var len = a.length;
        var copy = Array(len);
        for (var i = 0; i < len; i++) {
            copy[i] = a[i];
        }
        return a;
    }
    /*
     * Create a shallow copy of an array.
     * Input: array with length 1.000.000, Executiontime: 3ms.
     * NOTE: looping over keys is faster then just looping over array.
     */
    function shallowCopyArrayBasedOnKeys(a) {
        var keys = Object.keys(a);
        var length = keys.length;
        var copy = Array(length);
        for (var i = 0; i < length; i++) {
            copy[i] = a[keys[i]];
        }
        return a;
    }
    /*
     * Create a shallow copy of an array using slice.
     * Input: array with length 1.000.000, Executiontime: 10ms.
     */
    function shallowCopyArrayWithSlice(a) {
        return a.slice(0);
    }
    /*
     * Create an array with legnth set on creation and add items with set operator.
     * Values are objects.
     * Input: 1.000.000, Executiontime: 120ms.
     */
    function createArray(total) {
        var result = new Array(total);
        for (var i = 0; i < total; i++) {
            var key = "W" + i.toString();
            result[i] = { id: key };
        }
        return result;
    }
    /*
     * Create an array with length set on creation and add items with set operator with holes in keys.
     * Values are objects.
     * Input: 1.000.000, Executiontime: 170ms.
     */
    function createArrayWithHoles(total) {
        var result = new Array(total);
        for (var i = 0; i < total; i++) {
            var key = "W" + i.toString();
            var keyAsNumber = convertToNumber(key);
            result[keyAsNumber] = { id: key };
        }
        return result;
    }
    function convertToNumber(s) {
        var result = 0;
        for (var i = 0, length = s.length; i < length; i++) {
            result += s.charCodeAt(i);
        }
        return result;
    }
    /*
     * Create an array with length set on creation and add items with push().
     * Values are objects.
     * Input: 1.000.000, Executiontime: 230ms.
     */
    function createArrayWithPush(total) {
        var result = [];
        for (var i = 0; i < total; i++) {
            result.push({ id: "W" + i.toString() });
        }
        return result;
    }
    var MyMap = (function () {
        function MyMap(total) {
            for (var i = 0; i < total; i++) {
                var key = "W" + i.toString();
                this[key] = { id: key };
            }
        }
        return MyMap;
    })();
    /*
     * Create an object.
     * Input: 1.000.000, Executiontime: 900ms.
     */
    function createObject(total) {
        return new MyMap(total);
    }
    /*
     * Create a shallow copy of an object.
     * Input: object with 1.000.000 properties, Executiontime: 1000ms.
     */
    function shallowCopyObject(o) {
        var keys = Object.keys(o);
        var copy = {};
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            copy[key] = o[key];
        }
        return copy;
    }
})(tests || (tests = {}));
//# sourceMappingURL=tests.js.map