var app;
(function (app) {
    var perf;
    (function (perf) {
        var services;
        (function (services) {
            "use strict";
            var DocumentService = (function () {
                function DocumentService(document, renderService) {
                    this._document = document;
                    this._renderService = renderService;
                }
                DocumentService.prototype.AttachEventListeners = function () {
                    var self = this;
                    function clickHandler(event) {
                        if (event.target["id"] === "executeButton") {
                            self._renderService.Render(self._document.getElementById("board"));
                        }
                    }
                    this._document.addEventListener("click", clickHandler, false);
                };
                return DocumentService;
            })();
            services.DocumentService = DocumentService;
            var RenderService = (function () {
                function RenderService() {
                }
                RenderService.prototype.Render = function (board) {
                    var content = "";
                    for (var i = 0, length = 1000; i < length; i += 1) {
                        content += '<div id="item_' + i.toString() + '" class="item"><span><span>' + i.toString() + "</span></span></div>";
                    }
                    board.innerHTML = content;
                    var t0 = performance.now();
                    var currentNode;
                    var ni = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT);
                    var totalNodesCount = 0;
                    while (currentNode = ni.nextNode()) {
                        totalNodesCount += 1;
                        if (totalNodesCount === 100) {
                            var test = "break";
                            var element = currentNode;
                            element.classList.add("error");
                        }
                    }
                    console.log("Aantal nodes: " + totalNodesCount.toString());
                    var t1 = performance.now();
                    console.log("Call to exectue took " + (t1 - t0) + " milliseconds.");
                };
                RenderService.prototype.UpdateSingleItem = function (item) {
                    item.innerText = "upd";
                };
                return RenderService;
            })();
            services.RenderService = RenderService;
        })(services = perf.services || (perf.services = {}));
    })(perf = app.perf || (app.perf = {}));
})(app || (app = {}));
var ds = new app.perf.services.DocumentService(document, new app.perf.services.RenderService());
ds.AttachEventListeners();
//# sourceMappingURL=performance.js.map