var helpers;
(function (helpers) {
    var text;
    (function (text_1) {
        function toSnakeCase(text) {
            return text.split(/(?=[A-Z])/).join("-").toLowerCase();
        }
        text_1.toSnakeCase = toSnakeCase;
    })(text = helpers.text || (helpers.text = {}));
})(helpers || (helpers = {}));
