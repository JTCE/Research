module fb {
    "use strict";

    app.directive("page", ["$compile", Page]);

    function Page($compile: ng.ICompileService) {
        
        var template = `<button type="button" ng-bind="buttonText" ng-click="showWizard()"></button>`;
        
        function link($scope: IPageScope) {
            $scope.buttonText = "Show wizard";
            $scope.showWizard = showWizard.bind(this);

            function showWizard() {

                $scope.fancybox = $.fancybox(
                    '<div></div>', // Dummy dom element. Fancybox needs at least one dom element to show.
                    {
                        afterShow: function () {
                            // To make angular work with a dynamic html template string, this string should first be compiled.
                            var template = '<div wijzig-telefoonnumer-wizard class="wijzig-telefoonnumer-wizard"></div>';
                            var content = $compile(template)($scope);

                            var inner = this.inner;
                            inner.html(''); // Remove dummy element                    
                            inner.append(content); // Show the wizard.

                            // Apply angular bindings.
                            $scope.$digest();
                        },
                        autoSize: false,
                        width: 500,
                        height: 200
                    }
                );
            }
        }
        
        return {
            template: template,
            link: link
        };
    }

    interface IPageScope extends ng.IScope {
        buttonText: string;
        fancybox: any;
        showWizard: () => void;
    }
}