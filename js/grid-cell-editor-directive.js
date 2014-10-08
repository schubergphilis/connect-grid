(function (keypress, angular) {
    'use strict';

    angular.module('connect-grid').directive('gridCellEditor', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            compile: function () {
                return function (scope, element, attrs) {

                    var customTpl = scope.getCompiledColumnEditorTemplate(attrs.column);

                    if (customTpl) {
                        element.find('div').replaceWith(customTpl(scope));
                    }

                    scope.value = '';
                    scope.isVisible = false;


                    var keyBindingsListener = new keypress.Listener(element[0]);

                    keyBindingsListener.register_many([
                        {
                            'keys': 'enter',
                            'on_keydown': function () {
                                scope.confirmEditing();
                                scope.finishEditing();
                                scope.moveActiveCellRelative(1, 0);
                            }
                        },
                        {
                            'keys': 'esc',
                            'on_keydown': function () {
                                scope.cancelEditing();
                            }
                        }
                    ]);

                    scope.$watch('activeCellValue()', function (newVal) {
                        scope.value = newVal;
                    });

                    scope.$watch('isInEditMode', function (newVal) {
                        scope.isVisible = newVal && Number(scope.activeCellModel.column) === Number(attrs.column);

                        if (scope.isVisible) {
                            $timeout(function () {
                                if (scope.editModeInputBuffer) {
                                    scope.value = scope.editModeInputBuffer;
                                    scope.setEditModeInputBuffer(null);
                                }
                                scope.$broadcast('editorFocus');
                            });
                        }
                    });

                    scope.cancelEditing = function () {
                        scope.value = scope.activeCellValue();
                        scope.setActiveMode(false);
                        scope.$parent.$broadcast('setInputReady');
                    };

                    scope.confirmEditing = function () {
                        var row = scope.activeCellModel.row;
                        var col = scope.activeCellModel.column;
                        scope.gridOptions.onCellValueChange(scope.getRow(row), scope.getColumnName(col), scope.value, scope.getCellValue(row, col));
                    };

                    scope.finishEditing = function () {
                        scope.setCellValue(scope.value);
                        scope.setActiveMode(false);
                        scope.$parent.$broadcast('setInputReady');
                    };
                };
            },
            template: '<span ng-show="isVisible"><div></div></span>'
        };
    }]);

})(window.keypress, window.angular);