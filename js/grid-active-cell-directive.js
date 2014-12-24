(function (angular, keypress, _) {
    'use strict';

    angular.module('connect-grid').directive('gridActiveCell', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            scope: true,
            link: function (scope, element, attrs, ngModel) {

                var keyBindingsListener = new keypress.Listener(element.parent()[0]);

                /* test-code */
                window.keyBindingsListener = keyBindingsListener;
                /* end-test-code */

                var defaultKeyBindings = [
                    {
                        'keys': 'right',
                        'on_keydown': function () {
                            scope.moveActiveCellRelative(0, 1);
                        }
                    },
                    {
                        'keys': 'left',
                        'on_keydown': function () {
                            scope.moveActiveCellRelative(0, -1);
                        }
                    },
                    {
                        'keys': 'up',
                        'on_keydown': function () {
                            scope.moveActiveCellRelative(-1, 0);
                        }
                    },
                    {
                        'keys': 'down',
                        'on_keydown': function () {
                            scope.moveActiveCellRelative(1, 0);
                        }
                    },
                    {
                        'keys': 'tab',
                        'is_solitary': true,
                        'on_keydown': function () {
                            scope.moveActiveCellRelative(0, 1);
                        }
                    },
                    {
                        'keys': 'shift tab',
                        'is_solitary': true,
                        'on_keydown': function () {
                            scope.moveActiveCellRelative(0, -1);
                        }
                    },
                    {
                        'keys': 'enter',
                        'on_keydown': function () {
                            if (!scope.gridOptions.editable) {
                                return false;
                            }

                            scope.setActiveMode(true);
                        }
                    },
                    {
                        'keys': 'backspace',
                        'on_keydown': function () {
                            if (!scope.gridOptions.editable) {
                                return false;
                            }

                            var row = scope.activeCellModel.row;
                            var col = scope.activeCellModel.column;

                            var oldVal = scope.getCellValue(row, col);
                            scope.setCellValue('');
                            scope.gridOptions.onCellValueChange(scope.getRow(row), scope.getColumnName(col), '', oldVal);
                        }
                    }
                ];

                if ('activeCellKeyBindings' in scope.gridOptions) {
                    _.each(_.keys(scope.gridOptions.activeCellKeyBindings), function (k) {
                        var callback = scope.gridOptions.activeCellKeyBindings[k];

                        defaultKeyBindings.push({
                            keys: k,
                            on_keydown: function () {
                                var row = scope.activeCellModel.row;
                                var col = scope.activeCellModel.column;

                                callback(scope.getRow(row), scope.getColumnName(col), scope.getCellValue(row, col));
                            }
                        });

                    });
                }

                keyBindingsListener.register_many(defaultKeyBindings);

                element.on('dblclick', function () {
                    scope.setActiveMode(true);
                });

                scope.$on('active-cell-set', function () {
                    if (!scope.$$phase) {
                        scope.$digest();
                    }
                });

                scope.editModeInputBuffer = null;

                scope.setEditModeInputBuffer = function (value) {
                    scope.editModeInputBuffer = value;
                };

                scope.setActiveMode = function (mode) {
                    if (mode && (!scope.gridOptions.editable || !scope.isCellEditable(scope.activeCellModel.row, scope.activeCellModel.column))) {
                        // do not proceed activating if the cell or grid is not editable
                        return false;
                    }

                    scope.setGridActiveMode(mode);

                    if (mode) {
                        keyBindingsListener.stop_listening();
                    } else {
                        keyBindingsListener.listen();
                    }

                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.$on('activateCellEditor', function (event, data) {
                    scope.setActiveMode(true);
                    if (data.value) {
                        scope.editModeInputBuffer = data.value;
                    }
                });

                scope.moveActiveCellRelative = function (relativeDown, relativeRight) {
                    if (!scope.isInEditMode) {
                        scope.setActiveCell(ngModel.$modelValue.row + relativeDown, ngModel.$modelValue.column + relativeRight);

                        // todo: scroll element into view

                        if (!scope.$$phase) {
                            scope.$digest();
                        }
                    }
                };

                scope.activeCellTop = function () {
                    var cell = scope.getCellCoordinates(ngModel.$modelValue.row, ngModel.$modelValue.column);
                    return cell.top + scope.gridOptions.activeCellModifiers.top;
                };

                scope.activeCellLeft = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return cell.left + scope.gridOptions.activeCellModifiers.left;
                };

                scope.activeCellWidth = function () {
                    var cell = scope.getCellCoordinates(ngModel.$modelValue.row, ngModel.$modelValue.column);
                    return cell.width + scope.gridOptions.activeCellModifiers.width;
                };

                scope.activeCellHeight = function () {
                    var cell = scope.getCellCoordinates(ngModel.$modelValue.row, ngModel.$modelValue.column);
                    return cell.height + scope.gridOptions.activeCellModifiers.height;
                };

                scope.activeCellValue = function () {
                    return scope.getCellValue(ngModel.$modelValue.row, ngModel.$modelValue.column);
                };

                scope.setCellValue = function (value) {
                    scope.updateCellValue(ngModel.$modelValue.row, ngModel.$modelValue.column, value);

                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.$on('is-reading-input-change', function (e, value) {
                    scope.setGridIsReadingInput(value);

                    if (!scope.$$phase) {
                        scope.$digest();
                    }
                });

                scope.$on('grid-viewport-size-tracker.resize', function () {
                    // we need to recalculate activeCellTop
                    if (!scope.$$phase) {
                        scope.$digest();
                    }
                });

            },
            template: '<div class="grid__active-cell"\n     ng-style="{ top: px(activeCellTop()), left: px(activeCellLeft()), width: px(activeCellWidth()), height: px(activeCellHeight()) }">\n    <grid-cell-editor ng-repeat="col in columns()" ng-model="col" column="{{ $index }}"/>\n</div>'
        };
    }]);

})(window.angular, window.keypress, window._);