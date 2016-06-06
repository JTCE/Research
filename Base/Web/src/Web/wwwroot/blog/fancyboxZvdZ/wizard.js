var fb;
(function (fb) {
    "use strict";
    fb.app.directive("wijzigTelefoonnumerWizard", [Wizard]);
    function Wizard() {
        var template = "\n            <div class=\"wizard\">\n                <div class=\"header\">\n                    <div class=\"title\" ng-bind=\"resources.title\"></div>\n                    <div class=\"progress\" ng-bind=\"progressText()\"></div>\n                </div>\n                <div ng-if=\"step===1\">\n                    <div class=\"info\">\n                        Hier komt nog een mooie beschrijving voor stap {{step}}.\n                    </div>\n                    <div class=\"item\">\n                        <div class=\"label\">Telefoonnummer:</div>\n                        <input class=\"value\" data-val=\"true\" data-val-required=\"Dit veld is verplicht\" name=\"Phonenumber\" ng-model=\"phonenumber\" type=\"text\" value=\"\" aria-required=\"true\" aria-invalid=\"false\">\n                    </div>\n                </div>\n                <div ng-if=\"step===2\">\n                    <div class=\"info\">\n                        Hier komt nog een mooie beschrijving voor stap {{step}}.\n                    </div>\n                    <div class=\"item\">\n                        <div class=\"label\">Verificatiecode:</div>\n                        <input class=\"value\" data-val=\"true\" data-val-required=\"Dit veld is verplicht\" name=\"Phonenumber\" ng-model=\"phonenumber\" type=\"text\" value=\"\" aria-required=\"true\" aria-invalid=\"false\">\n                    </div>\n                </div>\n                <div ng-if=\"step===3\">\n                    <div class=\"info\">\n                        Hier komt nog een mooie beschrijving voor stap {{step}}.\n                    </div>\n                    <div class=\"item\">\n                        <div class=\"label\">Oude wachtwoord:</div>\n                        <input class=\"value\" data-val=\"true\" data-val-required=\"Dit veld is verplicht\" name=\"Phonenumber\" ng-model=\"phonenumber\" type=\"text\" value=\"\" aria-required=\"true\" aria-invalid=\"false\">\n                    </div>\n                </div>\n                <div class=\"footer\">\n                    <button class=\"button\" type=\"button\" ng-bind=\"nextText()\" ng-click=\"next()\"></button>\n                </div>\n            <div>\n        ";
        function link($scope) {
            $scope.resources = {
                next: "Ga verder",
                of: " van ",
                save: "Opslaan",
                title: "Wijzig telefoonnumer"
            };
            $scope.step = 1;
            $scope.total = 3;
            $scope.next = function () {
                if ($scope.step === 3) {
                    $.fancybox.close();
                }
                else {
                    $scope.step += 1;
                }
            };
            $scope.nextText = function () {
                return ($scope.step === $scope.total) ? $scope.resources.save : $scope.resources.next;
            };
            $scope.progressText = function () {
                return $scope.step + " " + $scope.resources.of + " " + $scope.total;
            };
        }
        return {
            template: template,
            link: link
        };
    }
})(fb || (fb = {}));
//# sourceMappingURL=wizard.js.map