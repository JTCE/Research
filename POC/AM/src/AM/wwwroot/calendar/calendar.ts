import performance from './libraries/am/performance/measure';
export function calendar() {
    console.log("calendar loaded.");
    performance.measure(renderCalendar);
}

function renderCalendar() {
    var total = 1000;
    var children = new Array <IElement>(total);
    for (var i = 0; i < total; i++) {
        children[i] = {
            name: "span"
        };
    }

    render(children);
}

function render(children: Array<IElement>) {

}

export interface IElement {
    name: string;
}
