// http://www.2ality.com/2012/06/continuation-passing-style.html
(function () {
    var modules = [
        { name: "module1", deps: ["module1_1", "module1_2", "module1_3"] },
        { name: "module1_1", deps: [] },
        { name: "module1_2", deps: [] },
        { name: "module1_3", deps: [] },
        { name: "module2", deps: [] },
        { name: "module3", deps: ["module3_1", "module3_2", "module3_3"] },
        { name: "module3_1", deps: [] },
        { name: "module3_2", deps: [] },
        { name: "module3_3", deps: [] },
    ];
    function getModule(name) {
        for (var i = 0, length = modules.length; i < length; i++) {
            var module = modules[i];
            if (module.name === name) {
                return module;
            }
        }
        throw new Error("module not found.");
    }
    var module1 = getModule("module1");
    var info = {
        counter: 0,
        done: endTreeLoading,
        moduleName: "toSnakeCase",
        parentModuleInfo: null,
        total: module1.deps.length
    };
    loadModule(module1, info);
    function loadDependencies(deps, info) {
        for (var i = 0; i < deps.length; i++) {
        }
    }
    function loadModule(module, info) {
        //if (Array.isArray(dep)) {
        //    var inf: IInfo = {
        //        counter: 0,
        //        done: dependencyLoaded,
        //        total: dep.length
        //    };
        //    loadDependencies(dep, inf);
        //} else {
        //    setTimeout(function (dep2, info2) {
        //        info2.counter = info2.counter + 1;
        //        dependencyLoaded(dep2);
        //        if (info2.counter === info2.total) {
        //            info2.done(dep);
        //        }
        //        // Check if we are done.
        //    }, 100, dep, info);
        //}
    }
    function endTreeLoading(message) {
        console.log("End tree loading: " + message);
    }
    function dependencyLoaded(dep) {
        console.log("Dependency loaded: " + dep);
    }
})();
//interface IModule {
//    deps: Array<string>
//}
//var module_1: IModule = {
//    deps: [
//        "module_1_1",
//        "module_1_2",
//        "module_1_3"
//    ]
//};
//var module_1_1: IModule = {
//    deps: [
//    ]
//};
//var module_1_2: IModule = {
//    deps: [
//    ]
//};
//var module_1_3: IModule = {
//    deps: [
//    ]
//};
//var module_2: IModule = {
//    deps: [
//    ]
//};
//var module_3: IModule = {
//    deps: [
//        "module_3_1",
//        "module_3_2"
//    ]
//};
//var module_3_1: IModule = {
//    deps: [
//        "module_3_1_1"
//    ]
//};
//var module_3_1_1: IModule = {
//    deps: [
//    ]
//};
//var module_3_2: IModule = {
//    deps: [
//    ]
//};
//var toSnakeCase: IModule = {
//    deps: [
//        "module_1",
//        "module_2",
//        "module_3"
//    ]
//};
//var register = {
//    module_1: module_1, 
//    module_1_1: module_1_1,
//    module_1_2: module_1_2,
//    module_1_3: module_1_3,
//    module_2: module_2,
//    module_3: module_3,
//    module_3_1: module_3_1,
//    module_3_1_1: module_3_1_1,
//    module_3_2: module_3_2,
//    toSnakeCase: toSnakeCase
//}; 
