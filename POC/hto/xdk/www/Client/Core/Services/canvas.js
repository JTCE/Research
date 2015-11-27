
(function (hto, document) {
	"use strict";

	function Canvas() {
	}

	Canvas.prototype.getDataUrl = function (id, removePrefix) {
	    var canvas = document.getElementById(id);
		var dataURL = canvas.toDataURL("image/png");
		if (removePrefix) {
			dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
		}

		return dataURL;
	};

	hto.services.canvas = new Canvas();

}(hto, document));