var am;
(function (am) {
    var nano;
    (function (nano) {
        "use strict";
        /**
          * Inspired by: https://github.com/ModuleLoader/es6-module-loader/blob/master/src/system-fetch.js
          *  - without XDomainRequest support
          */
        function fetch(options) {
            var authorization = options.authorization;
            var onError = options.onError;
            var url = options.url;
            var xhr = new XMLHttpRequest();
            function load() {
                var result = {
                    additionalData: options.additionalData,
                    data: xhr.responseText
                };
                options.onSuccess(result);
            }
            function error() {
                var err = new Error('XHR error' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText : '') + ')' : '') + ' loading ' + url);
                var errorHandlerSupplied = (typeof onError === "function");
                if (errorHandlerSupplied) {
                    var result = {
                        additionalData: options.additionalData,
                        error: err
                    };
                    onError(result);
                }
                else {
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
        nano.fetch = fetch;
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
        function load(name, onSuccess) {
            var endModuleLoading = onSuccess;
            var normalizedName = normalizeName(name, []);
            var mod = get(normalizedName);
            if (mod) {
                endModuleLoading(mod);
            }
            else {
                loadInternal(name);
            }
        }
        nano.load = load;
        function loadInternal(name) {
            var url = (System.baseURL || '/') + name + '.js';
            fetchAndEval(url, function () {
                var mod = internalRegistry[name];
                if (!mod) {
                    throw new Error('Error loading module ' + name);
                }
                //visitTree(mod.deps, loadInternal
            });
        }
        //function loadDependencies(mod: any, info: IDepedenciesLoadInfo) {
        //    var depsToLoadCount = mod.deps.length;
        //    for (var i = 0; i < depsToLoadCount; i++) {
        //        var depName = mod.deps[i];
        //        var dependencyLoaded = (externalRegistry[depName] || internalRegistry[depName]);
        //        if (dependencyLoaded) {
        //        } else {
        //            loadInternal(depName, info);
        //        }
        //    }
        //}
        // http://www.2ality.com/2012/06/continuation-passing-style.html
        function parMapCps(arrayLike, func, done) {
            var resultCount = 0;
            var resultArray = new Array(arrayLike.length);
            for (var i = 0; i < arrayLike.length; i++) {
                func(arrayLike[i], i, maybeDone.bind(null, i)); // (*)
            }
            function maybeDone(index, result) {
                resultArray[index] = result;
                resultCount++;
                if (resultCount === arrayLike.length) {
                    done(resultArray);
                }
            }
        }
        function done(result) {
            console.log("RESULT: " + result); // RESULT: ONE,TWO,THREE
        }
        function fetchAndEval(name, onSuccess) {
            var url = (System.baseURL || '/') + name + '.js';
            var info = {
                onFetchAndEvalSuccess: onSuccess
            };
            fetch({ url: url, onSuccess: evalModule, additionalData: info });
        }
        function getModuleFromInternalRegistry(name) {
            var mod = internalRegistry[name];
            if (!mod) {
                throw new Error('Error loading module ' + name);
            }
            return mod;
        }
        function evalModule(result) {
            eval(result.data);
            var info = result.additionalData;
            info.onFetchAndEvalSuccess();
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
        nano.register = register;
        function set(name, values) {
            externalRegistry[name] = values;
        }
    })(nano = am.nano || (am.nano = {}));
})(am || (am = {}));
var System = System || {
    baseURL: "/",
    fetch: am.nano.fetch,
    import: am.nano.load,
    register: am.nano.register
};
