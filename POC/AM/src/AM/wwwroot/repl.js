// http://www.2ality.com/2012/06/continuation-passing-style.html
(function () {
    var modules = [
        { name: "module1", deps: ["module1_1", "module1_2", "module1_3", "module2", "module3"] },
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
    var rootInfo = {
        counter: 0,
        done: endTreeLoading,
        mod: module1,
        parentInfo: null,
        total: module1.deps.length
    };
    loadModule(module1, rootInfo);
    function loadModule(mod, info) {
        setTimeout(fakeFetchAndLoad, 100, mod, info);
    }
    function fakeFetchAndLoad(mod, info) {
        var isRootModule = (info.parentInfo === null);
        var hasDepedencies = (mod.deps.length > 0);
        if (isRootModule && !hasDepedencies) {
            info.done(info);
        }
        if (!isRootModule && !hasDepedencies) {
            info.done(info);
            updateParentInfo(info);
        }
        if (hasDepedencies) {
            loadDependencies(mod.deps, info);
        }
    }
    function updateParentInfo(info) {
        var parentInfo = info.parentInfo;
        if (parentInfo) {
            parentInfo.counter += 1;
            if (parentInfo.counter === parentInfo.total) {
                parentInfo.done(parentInfo);
                if (parentInfo.parentInfo) {
                    updateParentInfo(parentInfo);
                }
            }
        }
    }
    function loadDependencies(deps, parentInfo) {
        for (var i = 0; i < deps.length; i++) {
            var dep = deps[i];
            var mod = getModule(dep);
            var childInfo = {
                counter: 0,
                done: dependencyLoaded,
                mod: mod,
                parentInfo: parentInfo,
                total: mod.deps.length
            };
            loadModule(mod, childInfo);
        }
    }
    function endTreeLoading(info) {
        console.log("End tree loading: " + info.mod.name);
    }
    function dependencyLoaded(info) {
        console.log("Dependency loaded: " + info.mod.name);
    }
})();
