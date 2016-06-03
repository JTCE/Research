module fb {
    "use strict";

    app.directive("wizard", [Wizard]);

    function Wizard() {
        var template = `
            <div class="header">
                <div class="title" ng-bind="resources.title"></div>
                <div class="progress" ng-bind="progressText()"></div>
            </div>
            <div ng-if="step===1">
                <input data-val="true" data-val-required="Dit veld is verplicht" name="Phonenumber" ng-model="phonenumber" type="text" value="" aria-required="true" aria-invalid="false">
            </div>
            <div ng-if="step===2">
                <input data-val="true" data-val-required="Dit veld is verplicht" name="Verificationcode" ng-model="verificationcode" type="text" value="" aria-required="true" aria-invalid="false">
            </div>
            <div ng-if="step===3">
                <input data-val="true" data-val-required="Dit veld is verplicht" name="Password" ng-model="password" type="text" value="" aria-required="true" aria-invalid="false">
            </div>
            <div>
                <button type="button" ng-bind="nextText()" ng-click="showWizard()"></button>
            </div>
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
            $scope.nextText = () => { return ($scope.step === $scope.total) ? $scope.resources.save : $scope.resources.next; };
            $scope.progressText = () => { return `$scope.step $scope.resources.of $scope.total`; };
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