(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridInputReader', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function (scope, element/*, attrs, ngModel*/) {
                scope.input = '';
                scope.textAreaPosition = 'absolute';

                scope.editorTopPosition = function () {
                    var activeCellCoordinates = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return activeCellCoordinates.top;
                };

                scope.editorLeftPosition = function () {
                    var activeCellCoordinates = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return activeCellCoordinates.left;
                };

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
                    var textareaEl = element.find('textarea')[0];
                    textareaEl.value = scope.renderCellContent(scope.activeCellModel.row, scope.activeCellModel.column);
                    textareaEl.select();
                };

                scope.$on('setInputReady', select);
            },
            template: '<textarea ng-model="input" ng-style="{ top: px(editorTopPosition()), left: px(editorLeftPosition()), position: textAreaPosition}"></textarea>'
        };

    }]);

})(window.angular);