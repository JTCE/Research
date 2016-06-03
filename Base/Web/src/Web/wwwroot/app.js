var app;
(function (app) {
    "use strict";
    const _recordsElementId = "records";
    function selectAll() {
        var records = document.getElementById(_recordsElementId).children;
        foreach(records, select);
        const x = 2;
        // Prevent default behaviour of anchor.
        return false;
    }
    app.selectAll = selectAll;
    function select(record) {
        const checkbox = record.children[0];
        checkbox.checked = true;
    }
    function foreach(records, fn, data) {
        for (var i = 0, length = records.length; i < length; i++) {
            fn(records[i], data);
        }
    }
})(app || (app = {}));
//# sourceMappingURL=app.js.map