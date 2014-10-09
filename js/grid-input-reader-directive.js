(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridInputReader', ['$rootScope', 'gridInputParser', function ($rootScope, gridInputParser) {
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

                        if ([].forEach && gridInputParser.isTabularData(newVal)) {

                            gridInputParser.getRows(newVal).forEach(function (row, rowOffset) {
                                var rowToUpdateIndex = scope.activeCellModel.row + rowOffset;

                                if (rowToUpdateIndex > -1) {
                                    var isExisitingRow = !!scope.getRow(rowToUpdateIndex);
                                    var columnValuesForNewRow = {};

                                    gridInputParser.getColumns(row).forEach(function (val, columnOffset) {
                                        var colToUpdateIndex = scope.activeCellModel.column + columnOffset;

                                        if (isExisitingRow) {
                                            scope.updateCellValue(rowToUpdateIndex, colToUpdateIndex, val);
                                        } else {
                                            var column = scope.columns()[colToUpdateIndex];
                                            if (column && column.field) {
                                                columnValuesForNewRow[column.field] = scope.resolveFieldValue(null, colToUpdateIndex, val);
                                            }
                                        }
                                    });

                                    if (!isExisitingRow) {
                                        scope.gridOptions.onNewRowPaste(columnValuesForNewRow);
                                    }
                                }
                            });

                            scope.input = '';
                            return;
                        }

                        scope.$broadcast('activateCellEditor', {
                            value: newVal
                        });

                        scope.input = '';
                    }
                });

                element.find('textarea').on('focus', function () {
                    scope.readingInputStarted();
                });

                element.find('textarea').on('blur', function () {
                    scope.readingInputStopped();
                });

                scope.$watch('activeCellModel', function (/*newVal*/) {
                    select();
                }, true);

                element.on('dblclick', function () {
                    scope.setActiveMode(true);
                });

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