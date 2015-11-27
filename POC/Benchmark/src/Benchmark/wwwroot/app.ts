module Benchmark {

    interface IApp {
        start();
    }

    class App implements IApp {

        private _counter: number = 0;

        constructor() {
        }

        doSomething() {
            for (var i = 0, length = 100000; i < length; i++) {
                this._counter += i;
                // more statements
            }
        }
        
        start() {
            console.log("Benchmark started.");
            var t0 = performance.now();
            this.doSomething();
            var t1 = performance.now();
            console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
        }
    }
    
    var a = new App();
    a.start();
}
