
(function (hto) {
	"use strict";

	function User() {
		/// <summary>
		/// Represent a user.
	    /// </summary>
	    this.isAuthenticated = false;
	    this.name = "User 1";
	    this.nameLabel = "Gebruikersnaam";
        this.password = "";
        this.passwordLabel = "Wachtwoord";
        this.rememberMe = false;
        this.token = null;
	}

	hto.models.User = User;
	
}(hto));