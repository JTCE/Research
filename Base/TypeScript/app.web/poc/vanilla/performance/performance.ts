module app.perf.services {
    "use strict"

    export class DocumentService {
        _document: Document;
        _renderService: app.perf.services.RenderService;

        constructor(document: Document, renderService: app.perf.services.RenderService) {
            this._document = document;
            this._renderService = renderService;
        }

        AttachEventListeners() {
            var self = this;
            function clickHandler(event: MouseEvent) {
                if (event.target["id"] === "executeButton") {
                    self._renderService.Render(<HTMLElement>self._document.getElementById("board"));
                }
            }
            this._document.addEventListener("click", clickHandler, false);
        }
    }

    export class RenderService {

        

        Render(board: HTMLElement) {
            var content = "";
            for (var i = 0, length = 1000; i < length; i += 1) {
                content += '<div id="item_' + i.toString() + '" class="item"><span><span>' + i.toString() + "</span></span></div>"
            }
            board.innerHTML = content;

            var t0 = performance.now();
            

            var currentNode: Node;
            var ni = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT);

            var totalNodesCount = 0;
            while (currentNode = ni.nextNode()) {
                totalNodesCount += 1;
                if (totalNodesCount === 100) {
                    var test = "break";
                    var element = <HTMLElement>currentNode;
                    element.classList.add("error");
                }
            }
            console.log("Aantal nodes: " + totalNodesCount.toString());

            var t1 = performance.now();
            console.log("Call to exectue took " + (t1 - t0) + " milliseconds.");
        }

        UpdateSingleItem(item: HTMLDivElement) {
            item.innerText = "upd";
        }
    }
}

var ds = new app.perf.services.DocumentService(document, new app.perf.services.RenderService());
ds.AttachEventListeners();

