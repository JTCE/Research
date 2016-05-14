var app;
(function (app) {
    "use strict";
    var _recordsElementId = "records";
    function selectAll() {
        var records = document.getElementById(_recordsElementId).children;
        foreach(records, select);
        // Prevent default behaviour of anchor.
        return false;
    }
    app.selectAll = selectAll;
    function select(record) {
        var checkbox = record.children[0];
        checkbox.checked = true;
    }
    function foreach(records, fn, data) {
        for (var i = 0, length = records.length; i < length; i++) {
            fn(records[i], data);
        }
    }
})(app || (app = {}));
