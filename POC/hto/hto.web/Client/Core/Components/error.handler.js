(function () {
	"use strict";
	
	function showError(errorMsg, url, lineNumber, column, errorObj) {
		var message = "";
		if (errorMsg) {
			message += "<p>Message: " + errorMsg + "</p>";
		}

		if (url) {
			message += "<p>Url: " + url + "</p>";
		}

		if (lineNumber) {
			message += "<p>LineNumber: " + lineNumber + "</p>";
		}

		if (column) {
			message += "<p>Column: " + column + "</p>";
		}

		if (errorObj) {
			message += "<p>Error: " + errorObj + "</p>";
		}
		
		document.open();
		document.write("<div>" + message + "</div>");
		document.close();
	}

	window.onerror = showError;
}());