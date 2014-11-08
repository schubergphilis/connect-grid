(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridInputReader', ['$rootScope', '$timeout', 'gridInputParser', function ($rootScope, $timeout, gridInputParser) {
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

                            var newRows = [];
                            var bulkRowsChanges = [];

                            gridInputParser.getRows(newVal).forEach(function (row, rowOffset) {
                                var rowToUpdateIndex = scope.activeCellModel.row + rowOffset;

                                if (rowToUpdateIndex > -1) {
                                    var isExisitingRow = !!scope.getRow(rowToUpdateIndex);
                                    var columnValuesForNewRow = {};

                                    var rowChanges = {
                                        row: scope.getRow(rowToUpdateIndex),
                                        changes: []
                                    };

                                    gridInputParser.getColumns(row).forEach(function (val, columnOffset) {
                                        var colToUpdateIndex = scope.activeCellModel.column + columnOffset;


                                        if (isExisitingRow) {
                                            var oldValue = scope.getCellValue(rowToUpdateIndex, colToUpdateIndex);
                                            var newValue = scope.updateCellValue(rowToUpdateIndex, colToUpdateIndex, val);
                                            var columnName = scope.getColumnName(colToUpdateIndex);

                                            scope.gridOptions.onCellValueBulkChange(rowChanges.row, columnName, newValue, oldValue);
                                            rowChanges.changes.push({
                                                                        columnName: columnName,
                                                                        newValue: newValue,
                                                                        oldValue: oldValue
                                                                    });
                                        } else {
                                            var column = scope.columns()[colToUpdateIndex];
                                            if (column && column.field) {
                                                columnValuesForNewRow[column.field] = scope.resolveFieldValue(null, colToUpdateIndex, val);
                                            }
                                        }
                                    });

                                    if (isExisitingRow) {
                                        bulkRowsChanges.push(rowChanges);
                                    } else {
                                        scope.gridOptions.onNewRowPaste(columnValuesForNewRow);
                                        newRows.push(columnValuesForNewRow);
                                    }
                                }
                            });

                            if (bulkRowsChanges.length > 0) {
                                scope.gridOptions.onExistingRowsPaste(bulkRowsChanges);
                            }

                            if (newRows.length > 0) {
                                scope.gridOptions.onNewRowsPaste(newRows);
                            }

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
                    setTimeout(function () {
                        textareaEl.select();
                    }, 0);
                };

                scope.$on('grid-input-ready', select);
            },
            template: '<textarea ng-model="input" ng-style="{ top: px(editorTopPosition()), left: px(editorLeftPosition()), position: textAreaPosition}"></textarea>'
        };

    }]);

})(window.angular);