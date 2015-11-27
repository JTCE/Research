
(function (hto) {
	"use strict";

	function DesktopMessage() {
		/// <summary>
		/// Represents a message sent from the desktop application.
		/// </summary>

		this.message = null;
		this.userName = null;
	}

	hto.models.DesktopMessage = DesktopMessage;

}(hto));