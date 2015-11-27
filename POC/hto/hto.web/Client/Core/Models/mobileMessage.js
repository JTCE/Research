
(function (hto) {
	"use strict";

	function MobileMessage() {
		/// <summary>
		/// Represents a message sent from the mobile application.
		/// </summary>

		this.latitude = null;
		this.longitude = null;
		this.locationImageUrl = null;
		this.message = null;
		this.signatureImageDataUrl = null;
		this.userName = null;
	}

	hto.models.MobileMessage = MobileMessage;

}(hto));