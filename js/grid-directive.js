(function (angular, _) {
    'use strict';

    angular.module('connect-grid')
        .directive('connectGrid', ['$compile', function ($compile) {
            var defaultOptions = {
                cellWidth: 70,
                cellHeight: 26,
                headerCellHeight: 26,
                selectable: true,
                editable: true,
                maxWidth: null,
                maxHeight: null,
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
                onNewRowPaste: function (/* columnValues */) {

                },
                onRowSelect: function (/* object */) {

                },
                activeCellKeyBindings: {},
                defaultEditableCellTemplate: '<grid-cell-editor-simple-textarea></grid-cell-editor-simple-textarea>'
            };

            return {
                restrict: 'E',
                scope: true,
                compile: function compile() {
                    return {
                        pre: function (scope, element, attrs) {

                            var collection = scope.$eval(attrs.ngModel);
                            var gridOptions = scope.$eval(attrs.gridOptions);

                            scope.gridOptions = _.extend({}, defaultOptions, gridOptions);

                            scope.isReadingInput = false;

                            scope.activeCellModel = {
                                row: 0,
                                column: 0
                            };

                            scope.scrollLeft = 0;
                            scope.scrollTop = 0;
                            scope.isScrolling = false;

                            scope.$watch(attrs.ngModel, function () {
                                scope.$broadcast('gridDataChanged');
                            }, true);

                            scope.$on('gridDataChanged', function () {
                                scope.resetActiveCell();
                            });

                            scope.$watch('activeCellModel.row', function (newVal) {
                                scope.gridOptions.onRowSelect(scope.getRow(newVal));
                            });

                            scope.$on('grid.start-cell-edit', function (event, data) {
                                if ('obj' in data && 'field' in data) {
                                    var row = scope.getRowIndex(data.obj);

                                    if (row !== -1 && row > -1) {
                                        var column = scope.getColumnByFieldName(data.field);

                                        if (column) {
                                            var col = scope.getColIndex(column);

                                            scope.setActiveCell(row, col);

                                            var activateData = {};

                                            if ('value' in data) {
                                                activateData.value = data.value;
                                            }

                                            scope.$broadcast('activateCellEditor', activateData);
                                        }
                                    }
                                }
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

                            scope.getRowIndex = function (obj) {
                                return _.indexOf(collection, obj);
                            };

                            scope.getColIndex = function (col) {
                                return _.indexOf(scope.columns(), col);
                            };

                            scope.getColumnByFieldName = function (columnName) {
                                return _.findWhere(scope.columns(), { field: columnName});
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

                            scope.isColumnEditable = function (col) {
                                var column = scope.columns()[col];
                                if (column && 'editable' in column) {
                                    return Boolean(column.editable);
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

                            scope.getDimensionsLimiterWidth = function () {
                                return element[0].getElementsByClassName('grid__dimensions-limiter')[0].offsetWidth;
                            };

                            scope.getGridMaxWidth = function () {
                                if (scope.gridOptions.maxWidth === null) {
                                    return 'auto';
                                } else {
                                    return scope.px(scope.gridOptions.maxWidth);
                                }
                            };

                            scope.getGridMaxHeight = function () {
                                if (scope.gridOptions.maxHeight === null) {
                                    return 'auto';
                                } else {
                                    return scope.px(scope.gridOptions.maxHeight);
                                }
                            };

                            scope.getCellWidth = function (row, col) {
                                var columns = scope.columns();
                                if (columns[col] && 'width' in columns[col]) {
                                    return columns[col].width;
                                }
                                return scope.gridOptions.cellWidth;
                            };

                            scope.getTotalWidth = function () {
                                var width = 0;
                                var columns = scope.columns();
                                _.each(columns, function (column, index) {
                                    width += scope.getCellWidth(0, index);
                                });
                                return width;
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
                                    if (_.isFunction(columns[col].cellClass)) {
                                        var value = scope.getCellValue(row, col);
                                        return columns[col].cellClass(value, scope.getRow(row), row, col, scope);
                                    } else {
                                        return columns[col].cellClass;
                                    }
                                }

                                return null;
                            };

                            scope.renderCellContent = function (row, col) {
                                var value = scope.getCellValue(row, col);

                                var columns = scope.columns();
                                if (columns[col] && 'renderer' in columns[col]) {
                                    return columns[col].renderer(value, scope.getRow(row), row, col, scope);
                                }

                                return _.isUndefined(value) ? '' : value;
                            };

                            scope.getIfHintVisible = function (row, col) {
                                var columns = scope.columns();

                                if (columns[col] && 'isHintVisible' in columns[col]) {
                                    var value = scope.getCellValue(row, col);
                                    var obj = scope.getRow(row);
                                    return columns[col].isHintVisible(value, obj, row, col, scope);
                                }

                                return false;
                            };

                            scope.getHintTemplateSrc = function (row, col) {
                                var columns = scope.columns();

                                if (columns[col] && 'hintTemplateSrc' in columns[col]) {
                                    var value = scope.getCellValue(row, col);
                                    var obj = scope.getRow(row);

                                    return columns[col].hintTemplateSrc(value, obj, row, col, scope);
                                }
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

                            scope.resolveFieldValue = function (row, col, value) {
                                var columns = scope.columns();

                                if (columns[col] && 'field' in columns[col]) {
                                    if ('valueResolver' in columns[col]) {
                                        var obj = row !== null ? scope.getRow(row) : null;
                                        value = columns[col].valueResolver(value, obj, row, col, scope);
                                    }
                                }

                                return value;
                            };

                            scope.updateCellValue = function (row, col, value) {
                                var columns = scope.columns();
                                if (columns[col] && 'field' in columns[col]) {
                                    var resolvedValue = scope.resolveFieldValue(row, col, value);
                                    collection[row][columns[col].field] = resolvedValue;
                                    return resolvedValue;
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

                            scope.setGridIsScrolling = function (value) {
                                scope.isScrolling = value;
                            };

                            scope.setGridScrollLeft = function (scrollLeft) {
                                scope.scrollLeft = scrollLeft;
                            };

                            scope.setGridScrollTop = function (scrollTop) {
                                scope.scrollTop = scrollTop;
                            };

                        },
                        post: function (scope, element/*, attrs*/) {
                            element.on('click', function () {
                                scope.$broadcast('setInputReady');
                            });
                        }
                    };
                },
                template: '<div class="grid__wrap">\n    <div class="grid__dimensions-limiter" grid-scroll-tracker ng-style="{width: getGridMaxWidth(), height: getGridMaxHeight()}">\n        <div class="grid__cells-total-dimensions" ng-style="{width: px(getTotalWidth())}">\n            <div class="grid__headers-container">\n                <div ng-repeat="column in columns()" class="grid__header-cell"\n                     ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(gridOptions.headerCellHeight) }">\n                    <grid-header-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-header-cell>\n                </div>\n            </div>\n            <div class="grid__rows-container">\n                <div ng-repeat="row in rows()" class="grid__row">\n                    <div ng-repeat="column in columns()" class="grid__cell"\n                         ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(getCellHeight($parent.$index, $index)) }">\n                        <grid-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-cell>\n                    </div>\n                </div>\n\n                <grid-active-cell ng-model="activeCellModel"\n                                  ng-class="{ \'grid-active-cell--is-active\': isReadingInput }"></grid-active-cell>\n                <grid-input-reader></grid-input-reader>\n            </div>\n        </div>\n    </div>\n    <cell-hints>\n        <active-cell-hint></active-cell-hint>\n    </cell-hints>\n</div>'
            };
        }]);
})(window.angular, window._);