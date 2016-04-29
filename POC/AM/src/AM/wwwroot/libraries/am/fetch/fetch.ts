/**
 * Fetch can be used to send and receive data over http(s).
 * Inspired by: https://github.com/ModuleLoader/es6-module-loader/blob/master/src/system-fetch.js
 *  - without XDomainRequest support.
 */
export function fetch(options: am.fetch.IFetchOptions): void {
    var authorization = options.authorization;
    var onError = options.onError;
    var url = options.url;
    var xhr = new XMLHttpRequest();

    function load() {
        var result: am.fetch.IFetchSuccessResult = {
            additionalData: options.additionalData,
            data: xhr.responseText
        };
        options.onSuccess(result);
    }

    function error() {
        var err = new Error('XHR error' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText : '') + ')' : '') + ' loading ' + url);

        var errorHandlerSupplied = (typeof onError === "function")
        if (errorHandlerSupplied) {
            var result: am.fetch.IFetchErrorResult = {
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