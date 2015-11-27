
(function (hto) {
	"use strict";

	function ChatMessage() {
		/// <summary>
		/// Represents a message sent from the mobile application.
		/// </summary>

	    this.appType = null;
	    this.message = null;
	    this.receivedDateTime = null;
	    this.sendDateTime = null;
	    this.token = null;
	}

	hto.models.ChatMessage = ChatMessage;

}(hto));
