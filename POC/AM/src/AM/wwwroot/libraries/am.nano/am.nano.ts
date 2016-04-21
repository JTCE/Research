
/**
 *  The am.nano module can be used to load ES6 modules.
 *  It is based on: https://github.com/caridy/es6-micro-loader/blob/master/dist/system-polyfill.js
 *  
 */
module am.nano {
    "use strict";
    
    /**
      * Inspired by: https://github.com/ModuleLoader/es6-module-loader/blob/master/src/system-fetch.js
      *  - without XDomainRequest support
      */
    export function fetch(options: IFetchOptions): void {
        var authorization = options.authorization;
        var onError = options.onError;
        var url = options.url;
        var xhr = new XMLHttpRequest();

        function load() {
            var result: IFetchSuccessResult = {
                additionalData: options.additionalData,
                data: xhr.responseText
            };
            options.onSuccess(result);
        }

        function error() {
            var err = new Error('XHR error' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText : '') + ')' : '') + ' loading ' + url);

            var errorHandlerSupplied = (typeof onError === "function")
            if (errorHandlerSupplied) {
                var result: IFetchErrorResult = {
                    additionalData: options.additionalData,
                    error: err
                };
                onError(result);
            } else {
                throw err;
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                // in Chrome on file:/// URLs, status is 0
                if (xhr.status == 0) {
                    if (xhr.responseText) {
                        load();
                    }
                    else {
                        // when responseText is empty, wait for load or error event
                        // to inform if it is a 404 or empty file
                        xhr.addEventListener('error', error);
                        xhr.addEventListener('load', load);
                    }
                }
                else if (xhr.status === 200) {
                    load();
                }
                else {
                    error();
                }
            }
        };
        xhr.open("GET", url, true);

        if (xhr.setRequestHeader) {
            xhr.setRequestHeader('Accept', 'application/x-es-module, */*');
            // can set "authorization: true" to enable withCredentials only
            if (authorization) {
                if (typeof authorization == 'string') {
                    xhr.setRequestHeader('Authorization', authorization.toString());
                }
                xhr.withCredentials = true;
            }
        }

        xhr.send(null);
    }
    
    var seen = Object.create(null);
    var internalRegistry = Object.create(null);
    var externalRegistry = Object.create(null);
    var anonymousEntry;

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
    
    export function load(name: string, onSuccess: (mod: any) => void) {
        var endTreeLoading = onSuccess;
        var normalizedName = normalizeName(name, []);

        var moduleAsCode = get(normalizedName);
        if (moduleAsCode) {
            endTreeLoading(moduleAsCode);
        } else {
            
            // To determine, "if all dependencies are loaded", this "rootInfo" object will be passed to and updated during the load process. 
            var rootInfo: ILoadInfo = {
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

    function fetchAndEval(info: ILoadInfo) {
        var url = (System.baseURL || '/') + info.normalizedName + '.js';
        fetch({
            url: url,
            onSuccess: evalModule,
            additionalData: info
        });
    }
        
    function getModuleFromInternalRegistry(name: string): any {
        var mod = internalRegistry[name];
        if (!mod) {
            throw new Error('Error loading module ' + name);
        }
        return mod;
    }

    function evalModule(result: IFetchSuccessResult) {
        eval(result.data);
        
        var info: ILoadInfo = result.additionalData;

        if (anonymousEntry) {
            // This loaded module was an anonymous module, now register it as an named module.
            System.register(info.normalizedName, anonymousEntry[0], anonymousEntry[1]);
            anonymousEntry = undefined;
        }
        

        var mod: IModule = getModuleFromInternalRegistry(info.normalizedName);
        info.mod = mod;
        info.total = mod.deps.length;
        handleLoadedModule(info);
    }

    function handleLoadedModule(info: ILoadInfo) {
        var mod = info.mod;
        var isRootModule = (info.parentInfo === null);
        var hasDepedencies = (mod.deps.length > 0);
        var shouldExecuteDone = (
            ((isRootModule && !hasDepedencies) || (!isRootModule && !hasDepedencies))
            && info.done
        );
        if (shouldExecuteDone) {
            var moduleAsCode = get(info.normalizedName);
            info.done(moduleAsCode);
        }

        if (!isRootModule && !hasDepedencies) {
            updateParentInfo(info);
        }

        if (hasDepedencies) {
            loadDependencies(mod.deps, info);
        }
    }

    function loadDependencies(deps: Array<string>, parentInfo: ILoadInfo) {
        for (var i = 0; i < deps.length; i++) {
            var dep: string = deps[i];
            loadDependency(dep, parentInfo);
        }
    }

    function loadDependency(name: string, parentInfo: ILoadInfo) {
        var normalizedName = normalizeName(name, []);

        var childInfo: ILoadInfo = {
            counter: 0,
            done: dependencyLoaded,
            mod: null,
            normalizedName: normalizedName,
            parentInfo: parentInfo,
            total: 0
        };

        var mod = get(normalizedName);
        if (mod) {
            childInfo.mod = mod;
            handleLoadedModule(childInfo);
        } else {
            fetchAndEval(childInfo);
        }
    }

    function dependencyLoaded(mod: any) {
        console.log("Dependency loaded");
    }

    function updateParentInfo(info: ILoadInfo) {
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

    export function register(name, deps, wrapper) {
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

    function set(name, values) {
        externalRegistry[name] = values;
    }
}

var System = System || {
    baseURL: "/",
    fetch: am.nano.fetch,
    import: am.nano.load,
    register: am.nano.register
};