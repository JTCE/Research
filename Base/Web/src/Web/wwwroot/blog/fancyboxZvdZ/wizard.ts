module fb {
    "use strict";

    app.directive("wizard", [Wizard]);

    function Wizard() {
        
        function link($scope: IWizardScope) {
            $scope.buttonText = "Toon wizard";
            $scope.showWizard = showWizard.bind(this);

            function showWizard() {

                $.fancybox(
                    '<div></div>', // Dummy dom element. Fancybox needs at least one dom element to show.
                    {
                        afterShow: function () {

                            // To make angular work with a dynamic html template string, this string should first be compiled.
                            var template = '<div wizard>Test</div>';
                            var content = $compile(template)($scope);

                            var inner = this.inner;
                            inner.html(''); // Remove dummy element                    
                            inner.append(content); // Show the wizard.

                            // Apply angular bindings.
                            $scope.$digest();
                        },
                        width: 'auto',
                        height: 'auto'
                    }
                );
            }
        }

        return {
            template: template,
            link: link
        };
    }

    interface IWizardScope extends ng.IScope {

        telefoonnummer: string;
        verificatiecode: string;
        wachtwoord: string;
    }
}