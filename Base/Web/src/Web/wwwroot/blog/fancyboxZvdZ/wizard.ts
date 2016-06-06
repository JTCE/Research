module fb {
    "use strict";

    app.directive("wijzigTelefoonnumerWizard", [Wizard]);

    function Wizard() {
        var template = `
            <div class="wizard">
                <div class="header">
                    <div class="title" ng-bind="resources.title"></div>
                    <div class="progress" ng-bind="progressText()"></div>
                </div>
                <div ng-if="step===1">
                    <div class="info">
                        Hier komt nog een mooie beschrijving voor stap {{step}}.
                    </div>
                    <div class="item">
                        <div class="label">Telefoonnummer:</div>
                        <input class="value" data-val="true" data-val-required="Dit veld is verplicht" name="Phonenumber" ng-model="phonenumber" type="text" value="" aria-required="true" aria-invalid="false">
                    </div>
                </div>
                <div ng-if="step===2">
                    <div class="info">
                        Hier komt nog een mooie beschrijving voor stap {{step}}.
                    </div>
                    <div class="item">
                        <div class="label">Verificatiecode:</div>
                        <input class="value" data-val="true" data-val-required="Dit veld is verplicht" name="Phonenumber" ng-model="phonenumber" type="text" value="" aria-required="true" aria-invalid="false">
                    </div>
                </div>
                <div ng-if="step===3">
                    <div class="info">
                        Hier komt nog een mooie beschrijving voor stap {{step}}.
                    </div>
                    <div class="item">
                        <div class="label">Oude wachtwoord:</div>
                        <input class="value" data-val="true" data-val-required="Dit veld is verplicht" name="Phonenumber" ng-model="phonenumber" type="text" value="" aria-required="true" aria-invalid="false">
                    </div>
                </div>
                <div class="footer">
                    <button class="button" type="button" ng-bind="nextText()" ng-click="next()"></button>
                </div>
            <div>
        `;

        function link($scope: IWizardScope) {
            $scope.resources = {
                next: "Ga verder",
                of: " van ",
                save: "Opslaan",
                title: "Wijzig telefoonnumer"
            };
            $scope.step = 1;
            $scope.total = 3;
            $scope.next = () => {
                if ($scope.step === 3) {
                    $.fancybox.close();
                    //debugger;
                }
                else {
                    $scope.step += 1;
                }
            };
            $scope.nextText = () => {
                return ($scope.step === $scope.total) ? $scope.resources.save : $scope.resources.next;
            };
            $scope.progressText = () => {
                return `${$scope.step} ${$scope.resources.of} ${$scope.total}`;
            };
        }

        return {
            template: template,
            link: link
        };
    }

    interface IWizardResources {
        next: string;
        of: string;
        save: string;
        title: string;
    }

    interface IWizardScope extends ng.IScope {
        next:() => void;
        nextText: () => string;
        password: string;
        phonenumber: string;
        progressText: () => string;
        resources: IWizardResources;
        step: number;
        total: number;
        verificationcode: string;
    }
}