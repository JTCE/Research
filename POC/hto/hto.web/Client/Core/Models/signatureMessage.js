
(function (hto) {
	"use strict";

	function SignatureMessage() {
		/// <summary>
		/// Represents a message sent from the mobile application.
		/// </summary>

		this.appType = null;
		this.latitude = null;
		this.longitude = null;
		this.locationImageUrl = null;
		this.message = null;
		this.signatureImageDataUrl = null;
		this.token = null;
	}

	hto.models.SignatureMessage = SignatureMessage;

}(hto));
