(function (angular, _) {
    'use strict';

    var gridCounter = 1;

    angular.module('connect-grid')
        .directive('connectGrid', ['$compile', function ($compile) {
            var defaultOptions = {
                cellWidth: 70,
                cellHeight: 26,
                headerCellHeight: 26,
                selectable: true,
                editable: true,
                columnDefs: {

                },
                activeCellModifiers: {
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0
                },
                onCellValueChange: function (/* row, column, newValue, oldValue */) {

                },
                onRowSelect: function (/* object */) {

                },
                activeCellKeyBindings: {},
                defaultEditableCellTemplate: '<grid-cell-editor-simple-textarea></grid-cell-editor-simple-textarea>'
            };

            return {
                restrict: 'E',
                scope: true,
                link: function (scope, element, attrs) {
                    var collection = scope.$eval(attrs.ngModel);
                    var gridOptions = scope.$eval(attrs.gridOptions);

                    scope.gridOptions = _.extend({}, defaultOptions, gridOptions);

                    scope.isReadingInput = false;

                    scope.activeCellModel = {
                        row: 0,
                        column: 0
                    };

                    scope.$watch(attrs.ngModel, function () {
                        scope.$broadcast('gridDataChanged');
                    });

                    scope.$on('gridDataChanged', function () {
                        scope.resetActiveCell();
                    });

                    scope.$watch('activeCellModel.row', function (newVal) {
                        scope.gridOptions.onRowSelect(scope.getRow(newVal));
                    });

                    scope.rows = function () {
                        return _.range(collection.length);
                    };

                    scope.columns = function () {
                        return scope.gridOptions.columnDefs;
                    };

                    scope.getRow = function (row) {
                        return collection[row];
                    };

                    scope.getColumnName = function (col) {
                        var column = scope.columns()[col];
                        if ('field' in column) {
                            return column.field;
                        }
                    };

                    scope.getCompiledColumnCellTemplate = function (col) {
                        var column = scope.columns()[col];
                        if ('cellTemplate' in column) {
                            return $compile(column.cellTemplate);
                        }
                    };

                    scope.getCompiledColumnEditorTemplate = function (col) {
                        var column = scope.columns()[col];
                        if ('editableCellTemplate' in column) {
                            return $compile(column.editableCellTemplate);
                        } else {
                            return $compile(scope.gridOptions.defaultEditableCellTemplate);
                        }
                    };

                    scope.isColumnSelectable = function (col) {
                        var column = scope.columns()[col];
                        if (column && 'selectable' in column) {
                            return Boolean(column.selectable);
                        }
                        return true;
                    };

                    /**
                     * @param {number} columnToSelect
                     * @param {number} currentColumn
                     */
                    scope.getClosestSelectableColumn = function (columnToSelect, currentColumn) {
                        var dir = currentColumn > columnToSelect ? -1 : +1;
                        var i, l;

                        if (dir === 1) {
                            for (i = columnToSelect, l = scope.columns().length; i < l; i += 1) {
                                if (scope.isColumnSelectable(i)) {
                                    return i;
                                }
                            }
                        } else {
                            for (i = columnToSelect; i > -1; i -= 1) {
                                if (scope.isColumnSelectable(i)) {
                                    return i;
                                }
                            }
                        }

                        return currentColumn;
                    };

                    scope.px = function (value) {
                        return value + 'px';
                    };

                    scope.getCellWidth = function (row, col) {
                        var columns = scope.columns();
                        if (columns[col] && 'width' in columns[col]) {
                            return columns[col].width;
                        }
                        return scope.gridOptions.cellWidth;
                    };

                    scope.getCellHeight = function (/* row, col */) {
                        return scope.gridOptions.cellHeight;
                    };

                    scope.getCellCoordinates = function (row, col) {
                        var left = 0;
                        for (var i = 0; i < col; i++) {
                            left += scope.getCellWidth(row, i);
                        }

                        return {
                            top: row * scope.gridOptions.cellHeight + scope.gridOptions.headerCellHeight,
                            left: left,
                            width: scope.getCellWidth(row, col),
                            height: scope.getCellHeight(row, col)
                        };
                    };

                    scope.getCellValue = function (row, col) {
                        var columns = scope.columns();
                        if (collection[row] && columns[col] && 'field' in columns[col]) {
                            return collection[row][columns[col].field];
                        }

                        return null;
                    };

                    scope.getCellClass = function (row, col) {
                        var columns = scope.columns();
                        if (columns[col] && 'cellClass' in columns[col]) {
                            return columns[col].cellClass;
                        }

                        return null;
                    };

                    scope.renderCellContent = function (row, col) {
                        var value = scope.getCellValue(row, col);

                        var columns = scope.columns();
                        if (columns[col] && 'renderer' in columns[col]) {
                            return columns[col].renderer(value, scope.getRow(row), row, col);
                        }

                        return _.isUndefined(value) ? '' : value;
                    };

                    scope.renderCellHeader = function (col) {
                        var columns = scope.columns();
                        if (columns[col] && 'displayName' in columns[col]) {
                            return columns[col].displayName;
                        }
                        if (columns[col] && 'field' in columns[col]) {
                            return columns[col].field;
                        }
                        return '';
                    };

                    scope.updateCellValue = function (row, col, value) {
                        var columns = scope.columns();
                        if (columns[col] && 'field' in columns[col]) {
                            collection[row][columns[col].field] = value;
                        }

                    };

                    scope.setActiveCell = function (row, col) {
                        var rowIndex = Math.min(Math.max(row, 0), scope.rows().length - 1);
                        var columnIndex = Math.min(Math.max(col, 0), scope.columns().length - 1);

                        if (!scope.isColumnSelectable(columnIndex)) {
                            columnIndex = scope.getClosestSelectableColumn(columnIndex, scope.activeCellModel.column);
                        }

                        scope.activeCellModel.row = rowIndex;
                        scope.activeCellModel.column = columnIndex;

                    };

                    scope.resetActiveCell = function () {
                        scope.setActiveCell(scope.activeCellModel.row, scope.activeCellModel.column);
                    };

                    scope.readingInputStarted = function () {
                        scope.isReadingInput = true;

                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    };

                    scope.readingInputStopped = function () {
                        scope.isReadingInput = false;

                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    };

                    element.on('click', function () {
                        scope.$broadcast('setInputReady');
                    });

                },
                template: '<div ng-repeat="column in columns()" class="grid__header-cell" ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(gridOptions.headerCellHeight) }"><grid-header-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-header-cell></div><div ng-repeat="row in rows()" class="grid__row"><div ng-repeat="column in columns()" class="grid__cell" ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(getCellHeight($parent.$index, $index)) }"><grid-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-cell></div></div><grid-active-cell ng-model="activeCellModel" ng-class="{ \'grid-active-cell--is-active\': isReadingInput }"></grid-active-cell><grid-input-reader></grid-input-reader>'
            };
        }]);
})(window.angular, window._);