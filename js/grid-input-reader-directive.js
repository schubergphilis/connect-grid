(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridInputReader', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function (scope, element/*, attrs, ngModel*/) {
                scope.input = '';

                scope.$watch('input', function (newVal, oldVal) {
                    if (newVal !== oldVal && newVal.length > 0) {
                        scope.$broadcast('activateCellEditor', {
                            value: newVal
                        });

                        scope.input = '';
                    }
                });

                element.find("textarea").on("focus", function () {
                    scope.readingInputStarted();
                });

                element.find("textarea").on("blur", function () {
                    scope.readingInputStopped();
                });

                scope.$watch('activeCellModel', function (newVal) {
                    select();
                }, true);

                var select = function () {
                    element.find('textarea')[0].value = scope.getCellValue(scope.activeCellModel.row, scope.activeCellModel.column);
                    element.find('textarea')[0].select();
                };

                scope.$on('setInputReady', select);
            },
            template: '<textarea ng-model="input"></textarea>'
        };

    }]);

})(window.angular);