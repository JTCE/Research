module app.models {
    "use strict"

    export class Dashboard {
        subtitle: string;
        title: string;
        widgets:Array<Widget>
    }

    export class Widget {
        name: string;
    }
}