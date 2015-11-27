
(function () {
    /// <summary>
    /// Zet de focus naar het element, zodra deze in de DOM wordt gezet.
    /// </summary>
    "use strict";

    function directive() {
        return {
            restrict: "A",
            link: link
        };

        function link($scope, $element) {
            $element[0].focus();
        }
    }

    angular
        .module("hto")
        .directive("htoFocus", [directive]);

}());