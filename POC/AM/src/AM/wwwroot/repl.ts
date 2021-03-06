﻿// http://www.2ality.com/2012/06/continuation-passing-style.html


(function () {
    
    interface ILoadInfo {
        counter: number;
        done: (info: ILoadInfo) => void,
        mod: IModule,
        parentInfo?: ILoadInfo,
        total: number;
    }

    interface IModule {
        deps: Array<string>,
        name: string;
    }

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
    
    function getModule(name: string) {
        for (var i = 0, length = modules.length; i < length; i++) {
            var module = modules[i];
            if (module.name === name) {
                return module;
            }
        }
        throw new Error("module not found.");
    }

    var module1 = getModule("module1");

    var rootInfo: ILoadInfo = {
        counter: 0,
        done: endTreeLoading,
        mod: module1,
        parentInfo: null,
        total: module1.deps.length
    };
    
    loadModule(module1, rootInfo);

    function loadModule(mod: IModule, info: ILoadInfo) {
        setTimeout(fakeFetchAndLoad, 100, mod, info);
    }

    function fakeFetchAndLoad(mod: IModule, info: ILoadInfo) {

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

    function updateParentInfo(info: ILoadInfo) {
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

    function loadDependencies(deps: Array<string>, parentInfo: ILoadInfo) {
        
        for (var i = 0; i < deps.length; i++) {
            var dep: string = deps[i];
            var mod = getModule(dep);
            var childInfo: ILoadInfo = {
                counter: 0,
                done: dependencyLoaded,
                mod: mod,
                parentInfo: parentInfo,
                total: mod.deps.length
            };
            loadModule(mod, childInfo);
        }
    }

    function endTreeLoading(info: ILoadInfo) {
        console.log("End tree loading: " + info.mod.name);
    }

    function dependencyLoaded(info: ILoadInfo) {
        console.log("Dependency loaded: " + info.mod.name);
    }
})();

