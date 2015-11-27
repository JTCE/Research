(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    var Test;
    (function (Test) {
        var MyCar = (function () {
            function MyCar() {
            }
            MyCar.prototype.start = function () {
                var test1 = "dasfdf f";
                var test2 = "dasfdf f";
            };
            return MyCar;
        })();
    })(Test = exports.Test || (exports.Test = {}));
});
//# sourceMappingURL=Test.js.map