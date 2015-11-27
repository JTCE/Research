var Benchmark;
(function (Benchmark) {
    var App = (function () {
        function App() {
            this._counter = 0;
        }
        App.prototype.doSomething = function () {
            for (var i = 0, length = 100000; i < length; i++) {
                this._counter += i;
            }
        };
        App.prototype.start = function () {
            console.log("Benchmark started.");
            var t0 = performance.now();
            this.doSomething();
            var t1 = performance.now();
            console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
        };
        return App;
    })();
    var a = new App();
    a.start();
})(Benchmark || (Benchmark = {}));
//# sourceMappingURL=app.js.map