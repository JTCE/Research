
(function (hto, window, document) {
	"use strict";

	function GlobalErrorHandling() {
	}

	GlobalErrorHandling.prototype.activate = function () {
		window.onerror = this.showError;
	};

	GlobalErrorHandling.prototype.removeNotification = function () {
		/// <summary>
		/// Remove all error notifications from the DOM.
		/// </summary>

		var notification = document.getElementById("hto-error-notification");
		if (notification) {
			notification.parentElement.removeChild(notification);
		}
	};

	GlobalErrorHandling.prototype.readMore = function () {
		//var notifications = document.getElementsByClassName
		var notification = document.getElementById("hto-error-notification");
		var detail = notification.getElementsByClassName("hto-detail")[0];
		detail.style.display = "block";
	};

	GlobalErrorHandling.prototype.showError = function (errorMsg, url, lineNumber, column, errorObj) {
		/// <summary>
		/// Show the error to the user.
		/// </summary>
		
		if (!errorMsg) {
			errorMsg = "Unknown error";
		}

		var content = '';
		
		var close = '<button class="hto-close-button" onclick="hto.services.globalErrorHandling.removeNotification()" type="button"><span>×</span></button>';
		content += close;

		var strong = '<strong>' + errorMsg + '</strong>';
		content += strong;

		var readMore = '<button class="hto-read-more-button" onclick="hto.services.globalErrorHandling.readMore()" type="button">Read more...</button>';
		content += readMore;
		
	    var detail = '<div class="hto-detail">';
	    if (url) {
	    	detail += "<p>Url: " + url + "</p>";
	    }
	    if (lineNumber) {
	    	detail += "<p>LineNumber: " + lineNumber + "</p>";
	    }
	    if (column) {
	    	detail += "<p>Column: " + column + "</p>";
	    }
	    if (errorObj) {
	    	detail += "<p>Error: " + errorObj + "</p>";
	    }
	    detail += '</div>';
	    content += detail;

	    var notification = document.createElement("div");
	    notification.setAttribute("id", "hto-error-notification");
	    notification.innerHTML = content;

	    hto.services.globalErrorHandling.removeNotification();

	    var first = document.body.children[0];
	    document.body.insertBefore(notification, first);
	    
	};

	hto.services.globalErrorHandling = new GlobalErrorHandling();
	hto.services.globalErrorHandling.activate();

}(hto, window, document));