/**
 *  When the TypeScript compilerOptions "module" is set to "System".
 *  It produces "System" spec compatible modules.
 *  To use these modules in a browser, this polyfill can used.
 *
 *  Note: the root module must be manualy imported, via a normal script tag.
 *  Note: it does not use promises.
 *
 *  It is based on: https://github.com/caridy/es6-micro-loader/blob/master/dist/system-polyfill.js
 *  Because it is used to load ES6 modules, by definition am.loader can't be a ES6 module.
 */
var am;
(function (am) {
    var loader;
    (function (loader) {
        "use strict";
        var seen = Object.create(null);
        var internalRegistry = Object.create(null);
        var externalRegistry = Object.create(null);
        var anonymousEntry;
        var headEl = document.getElementsByTagName('head')[0], ie = /MSIE/.test(navigator.userAgent);
        /**
         * A script tag is used to fetch and eval sources,
         * because fetching the data directly will not allow developers to see / debug the sources in the browser.
         */
        function createScriptNode(src, callback, info) {
            var node = document.createElement('script');
            // use async=false for ordered async?
            // parallel-load-serial-execute http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
            if (node.async) {
                node.async = false;
            }
            if (ie) {
                node["onreadystatechange"] = function () {
                    if (/loaded|complete/.test(this.readyState)) {
                        this.onreadystatechange = null;
                        callback(info);
                    }
                };
            }
            else {
                node.onload = node.onerror = function () {
                    callback(info);
                };
            }
            node.setAttribute('src', src);
            headEl.appendChild(node);
        }
        function ensuredExecute(name) {
            var mod = internalRegistry[name];
            if (mod && !seen[name]) {
                seen[name] = true;
                // one time operation to execute the module body
                mod.execute();
            }
            return mod && mod.proxy;
        }
        function get(name) {
            return externalRegistry[name] || ensuredExecute(name);
        }
        function has(name) {
            return !!externalRegistry[name] || !!internalRegistry[name];
        }
        function load(name, onSuccess) {
            var endTreeLoading = onSuccess;
            var normalizedName = normalizeName(name, []);
            var moduleAsCode = get(normalizedName);
            if (moduleAsCode && endTreeLoading) {
                endTreeLoading(moduleAsCode);
            }
            else {
                // To determine, "if all dependencies are loaded", this "rootInfo" object will be passed to and updated during the load process. 
                var rootInfo = {
                    counter: 0,
                    done: endTreeLoading,
                    mod: null,
                    normalizedName: normalizedName,
                    parentInfo: null,
                    total: 0
                };
                fetchAndEval(rootInfo);
            }
        }
        loader.load = load;
        function fetchAndEval(info) {
            var url = (System.baseURL || '/') + info.normalizedName + '.js';
            createScriptNode(url, onScriptLoad, info);
        }
        function getModuleFromInternalRegistry(name) {
            var mod = internalRegistry[name];
            if (!mod) {
                throw new Error('Error loading module ' + name);
            }
            return mod;
        }
        function onScriptLoad(info) {
            if (anonymousEntry) {
                // Register as an named module.
                System.register(info.normalizedName, anonymousEntry[0], anonymousEntry[1]);
                anonymousEntry = undefined;
            }
            var mod = getModuleFromInternalRegistry(info.normalizedName);
            info.mod = mod;
            info.total = mod.deps.length;
            handleLoadedModule(info);
        }
        function handleLoadedModule(info) {
            var mod = info.mod;
            var isRootModule = (info.parentInfo === null);
            var hasDepedencies = (mod.deps.length > 0);
            var shouldExecuteDone = (((isRootModule && !hasDepedencies) || (!isRootModule && !hasDepedencies)));
            if (shouldExecuteDone) {
                var moduleAsCode = get(info.normalizedName);
                if (info.done) {
                    info.done(moduleAsCode);
                }
            }
            if (!isRootModule && !hasDepedencies) {
                updateParentInfo(info);
            }
            if (hasDepedencies) {
                loadDependencies(mod.deps, info);
            }
        }
        function loadDependencies(deps, parentInfo) {
            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i];
                loadDependency(dep, parentInfo);
            }
        }
        function loadDependency(name, parentInfo) {
            var normalizedName = normalizeName(name, []);
            var childInfo = {
                counter: 0,
                done: null,
                mod: null,
                normalizedName: normalizedName,
                parentInfo: parentInfo,
                total: 0
            };
            var mod = get(normalizedName);
            if (mod) {
                childInfo.mod = mod;
                handleLoadedModule(childInfo);
            }
            else {
                fetchAndEval(childInfo);
            }
        }
        function updateParentInfo(info) {
            var parentInfo = info.parentInfo;
            if (parentInfo) {
                parentInfo.counter += 1;
                if (parentInfo.counter === parentInfo.total) {
                    var moduleAsCode = get(parentInfo.normalizedName);
                    if (parentInfo.done) {
                        parentInfo.done(moduleAsCode);
                    }
                    if (parentInfo.parentInfo) {
                        updateParentInfo(parentInfo);
                    }
                }
            }
        }
        function normalizeName(child, parentBase) {
            if (child.charAt(0) === '/') {
                child = child.slice(1);
            }
            if (child.charAt(0) !== '.') {
                return child;
            }
            var parts = child.split('/');
            while (parts[0] === '.' || parts[0] === '..') {
                if (parts.shift() === '..') {
                    parentBase.pop();
                }
            }
            return parentBase.concat(parts).join('/');
        }
        function register(name, deps, wrapper) {
            if (Array.isArray(name)) {
                // anounymous module
                anonymousEntry = [];
                anonymousEntry.push.apply(anonymousEntry, arguments);
                return; // breaking to let the script tag to name it.
            }
            var proxy = Object.create(null), values = Object.create(null), mod, meta;
            // creating a new entry in the internal registry
            internalRegistry[name] = mod = {
                // live bindings
                proxy: proxy,
                // exported values
                values: values,
                // normalized deps
                deps: deps.map(function (dep) {
                    return normalizeName(dep, name.split('/').slice(0, -1));
                }),
                // other modules that depends on this so we can push updates into those modules
                dependants: [],
                // method used to push updates of deps into the module body
                update: function (moduleName, moduleObj) {
                    meta.setters[mod.deps.indexOf(moduleName)](moduleObj);
                },
                execute: function () {
                    mod.deps.map(function (dep) {
                        var imports = externalRegistry[dep];
                        if (imports) {
                            mod.update(dep, imports);
                        }
                        else {
                            imports = get(dep) && internalRegistry[dep].values; // optimization to pass plain values instead of bindings
                            if (imports) {
                                internalRegistry[dep].dependants.push(name);
                                mod.update(dep, imports);
                            }
                        }
                    });
                    meta.execute();
                }
            };
            // collecting execute() and setters[]
            meta = wrapper(function (identifier, value) {
                values[identifier] = value;
                mod.lock = true; // locking down the updates on the module to avoid infinite loop
                mod.dependants.forEach(function (moduleName) {
                    if (internalRegistry[moduleName] && !internalRegistry[moduleName].lock) {
                        internalRegistry[moduleName].update(name, values);
                    }
                });
                mod.lock = false;
                if (!Object.getOwnPropertyDescriptor(proxy, identifier)) {
                    Object.defineProperty(proxy, identifier, {
                        enumerable: true,
                        get: function () {
                            return values[identifier];
                        }
                    });
                }
                return value;
            });
        }
        loader.register = register;
        function set(name, values) {
            externalRegistry[name] = values;
        }
    })(loader = am.loader || (am.loader = {}));
})(am || (am = {}));
var System = System || {
    baseURL: "/",
    import: am.loader.load,
    register: am.loader.register
};
//# sourceMappingURL=system.polyfill.js.map