var fb;
(function (fb) {
    "use strict";
    fb.app.directive("wizard", [Wizard]);
    function Wizard() {
        var template = "\n            <div class=\"header\">\n                <div class=\"title\" ng-bind=\"resources.title\"></div>\n                <div class=\"progress\" ng-bind=\"progressText()\"></div>\n            </div>\n            <div ng-if=\"step===1\">\n                <input data-val=\"true\" data-val-required=\"Dit veld is verplicht\" name=\"Phonenumber\" ng-model=\"phonenumber\" type=\"text\" value=\"\" aria-required=\"true\" aria-invalid=\"false\">\n            </div>\n            <div ng-if=\"step===2\">\n                <input data-val=\"true\" data-val-required=\"Dit veld is verplicht\" name=\"Verificationcode\" ng-model=\"verificationcode\" type=\"text\" value=\"\" aria-required=\"true\" aria-invalid=\"false\">\n            </div>\n            <div ng-if=\"step===3\">\n                <input data-val=\"true\" data-val-required=\"Dit veld is verplicht\" name=\"Password\" ng-model=\"password\" type=\"text\" value=\"\" aria-required=\"true\" aria-invalid=\"false\">\n            </div>\n            <div>\n                <button type=\"button\" ng-bind=\"nextText()\" ng-click=\"showWizard()\"></button>\n            </div>\n        ";
        function link($scope) {
            $scope.resources = {
                next: "Ga verder",
                of: " van ",
                save: "Opslaan",
                title: "Wijzig telefoonnumer"
            };
            $scope.step = 1;
            $scope.total = 3;
            $scope.nextText = function () { return ($scope.step === $scope.total) ? $scope.resources.save : $scope.resources.next; };
            $scope.progressText = function () { return "$scope.step $scope.resources.of $scope.total"; };
        }
        return {
            template: template,
            link: link
        };
    }
})(fb || (fb = {}));
//# sourceMappingURL=wizard.js.map