(function (keypress) {
    'use strict';

    window.gridActiveCellDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {

                var keyBindingsListener = new keypress.Listener();

                keyBindingsListener.register_many([
                    {
                        'keys'          : 'right',
                        'on_keydown'    : function() {
                            scope.moveActiveCellRelative(0, 1);
                        }
                    },
                    {
                        'keys'          : 'left',
                        'on_keydown'    : function() {
                            scope.moveActiveCellRelative(0, -1);
                        }
                    },
                    {
                        'keys'          : 'up',
                        'on_keydown'    : function() {
                            scope.moveActiveCellRelative(-1, 0);
                        }
                    },
                    {
                        'keys'          : 'down',
                        'on_keydown'    : function() {
                            scope.moveActiveCellRelative(1, 0);
                        }
                    },
                    {
                        'keys'          : 'tab',
                        'on_keydown'    : function() {
                            scope.moveActiveCellRelative(0, 1);
                        }
                    },
                    {
                        'keys'          : 'enter',
                        'on_keydown'    : function() {
                            scope.setActiveMode(true);
                        }
                    },
                    {
                        'keys'          : 'backspace',
                        'on_keydown'    : function() {
                            scope.setCellValue('');
                        }
                    }
                ]);

                element.on('dblclick', function () {
                    scope.setActiveMode(true);
                });

                scope.isInEditMode = false;
                scope.editModeInputBuffer = null;

                scope.setActiveMode = function (mode) {
                    scope.isInEditMode = mode;
                    if (mode) {
                        keyBindingsListener.stop_listening();
                    } else {
                        keyBindingsListener.listen();
                    }
                    if(!scope.$$phase) {
                        scope.$apply();
                    }
                };

                scope.$on('activateCellEditor', function(event, data){
                    scope.setActiveMode(true);
                    if (data.value) {
                        scope.editModeInputBuffer = data.value;
                    }
                });

                scope.$on('gridReady', function () {
                    scope.setActiveCell(0, 0);
                });

                scope.moveActiveCellRelative = function (relativeDown, relativeRight) {
                    if (!scope.isInEditMode) {
                        scope.setActiveCell(ngModel.$modelValue.row + relativeDown, ngModel.$modelValue.column + relativeRight);

                        // todo: scroll element into view

                        if(!scope.$$phase) {
                            scope.$apply();
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

                    if(!scope.$$phase) {
                        scope.$apply();
                    }
                };
            },
            template: '<div class="grid__active-cell" ng-style="{ top: px(activeCellTop()), left: px(activeCellLeft()), width: px(activeCellWidth()), height: px(activeCellHeight()) }"><grid-cell-editor/></div>'
        };
    };

})(window.keypress);

if (typeof exports === 'object') {
    module.exports = window.gridActiveCellDirective;
    delete window.gridActiveCellDirective;
}