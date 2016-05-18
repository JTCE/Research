module app {
    "use strict";
    const _recordsElementId = "records";

    export function selectAll() {
        var records = document.getElementById(_recordsElementId).children;

        foreach(records, select);
        
        const x = 2;

        // Prevent default behaviour of anchor.
        return false;
    }

    function select(record: HTMLLIElement) {
        const checkbox = <HTMLInputElement>record.children[0];
        checkbox.checked = true;
    }

    function foreach(records: any, fn: any, data?: any) {
        for (var i = 0, length = records.length; i < length; i++) {
            fn(records[i], data);
        }
    }
}