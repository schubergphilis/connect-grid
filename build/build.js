(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var gridDirective = require('./js/grid-directive');
var gridCellDirective = require('./js/grid-cell-directive');
var gridInputReaderDirective = require('./js/grid-input-reader-directive');
var gridActiveCellDirective = require('./js/grid-active-cell-directive');
var gridCellEditorDirective = require('./js/grid-cell-editor-directive');

window.angular.module('connect-grid', [])
    .directive('grid', gridDirective)
    .directive('gridCell', gridCellDirective)
    .directive('gridActiveCell', gridActiveCellDirective)
    .directive('gridCellEditor', gridCellEditorDirective)
    .directive('gridInputReader', gridInputReaderDirective);
},{"./js/grid-active-cell-directive":2,"./js/grid-cell-directive":3,"./js/grid-cell-editor-directive":4,"./js/grid-directive":5,"./js/grid-input-reader-directive":6}],2:[function(require,module,exports){
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

if (module) {
    module.exports = window.gridActiveCellDirective;
    delete window.gridActiveCellDirective;
}
},{}],3:[function(require,module,exports){
(function () {
    'use strict';

    window.gridCellDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs/*, ngModel */) {
                element.on('click', function () {
                    scope.setActiveCell(attrs.row, attrs.column);
                    scope.$apply();
                });
            },
            template: '<div class="grid__cell__content">{{ renderCellContent($parent.$index, $index) }}</div>'
        };
    };

})(window.keypress);

if (module) {
    module.exports = window.gridCellDirective;
    delete window.gridCellDirective;
}
},{}],4:[function(require,module,exports){
(function (keypress, angular) {
    'use strict';

    function moveCaretToEnd(el) {
        if (typeof el.selectionStart === 'number') {
            el.selectionStart = el.selectionEnd = el.value.length;
        } else if (el.createTextRange) {
            el.focus();
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
    }

    window.gridCellEditorDirective = ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            require: '?ngModel',
            compile: function (jqLite) {
                var textareaEl = jqLite.find('textarea')[0];

                return function (scope/*, element, attrs, ngModel*/) {
                    var keyBindingsListener = new keypress.Listener(textareaEl);


                    keyBindingsListener.register_many([
                        {
                            'keys'          : 'enter',
                            'on_keydown'    : function() {
                                scope.finishEditing();
                                scope.moveActiveCellRelative(1, 0);
                            }
                        },
                        {
                            'keys'          : 'esc',
                            'on_keydown'    : function() {
                                scope.cancelEditing();
                            }
                        }
                    ]);

                    angular.element(textareaEl).on('blur', function () {
                        scope.finishEditing();
                        scope.setActiveMode(false);
                    });

                    scope.value = '';
                    scope.isVisible = false;

                    scope.$watch('activeCellValue()', function (newVal) {
                        scope.value = newVal;
                    });

                    scope.$watch('isInEditMode', function (newVal) {
                        scope.isVisible = newVal;

                        if (newVal === true) {
                            $timeout(function () {
                                textareaEl.focus();
                                if (scope.editModeInputBuffer) {
                                    scope.value = scope.editModeInputBuffer;
                                    scope.editModeInputBuffer = null;
                                }
                                moveCaretToEnd(textareaEl);
                            });
                        }
                    });

                    scope.cancelEditing = function () {
                        scope.value = scope.activeCellValue();
                        scope.setActiveMode(false);
                        scope.$broadcast('setInputReady');
                    };

                    scope.finishEditing = function () {
                        scope.setCellValue(scope.value);
                        scope.setActiveMode(false);
                        scope.$broadcast('setInputReady');
                    };
                };
            },
            template: '<textarea ng-model="value" ng-show="isVisible">{{ activeCellValue() }}</textarea>'
        };
    }];

})(window.keypress, window.angular);

if (module) {
    module.exports = window.gridCellEditorDirective;
    delete window.gridCellEditorDirective;
}
},{}],5:[function(require,module,exports){
(function (_) {
    'use strict';

    window.gridDirective = function () {
        var defaultOptions = {
            cellWidth: 70,
            cellHeight: 26,
            columns: {

            },
            activeCellModifiers: {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            }
        };

        return {
            restrict: 'C',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if(!ngModel) {
                    return;     // do nothing if no ng-model
                }

                scope.gridOptions = _.extend({}, defaultOptions, scope.gridOptions);

                scope.rows = function () {
                    return _.range(ngModel.$modelValue.length);
                };

                scope.columns = function () {
                    return scope.gridOptions.columns;
                };

                scope.activeCellModel = {
                    row: 0,
                    column: 0
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
                        top: row * scope.gridOptions.cellHeight,
                        left: left,
                        width: scope.getCellWidth(row, col),
                        height: scope.getCellHeight(row, col)
                    };
                };

                scope.getCellValue = function (row, col) {
                    var columns = scope.columns();
                    if (columns[col] && 'name' in columns[col]) {
                        return ngModel.$modelValue[row][columns[col].name];
                    }

                    return null;
                };

                scope.renderCellContent = function (row, col) {
                    var value = scope.getCellValue(row, col);

                    var columns = scope.columns();
                    if (columns[col] && 'renderer' in columns[col]) {
                        return columns[col].renderer(value, scope.rows[row], row, col);
                    }

                    return value || '';
                };

                scope.updateCellValue = function (row, col, value) {
                    var columns = scope.columns();
                    if (columns[col] && 'name' in columns[col]) {
                        ngModel.$modelValue[row][columns[col].name] = value;
                    }

                };

                scope.setActiveCell = function (row, col) {
                    scope.activeCellModel.row = Math.min(Math.max(row, 0), scope.rows().length - 1);
                    scope.activeCellModel.column = Math.min(Math.max(col, 0), scope.columns().length - 1);
                };

                element.on('click', function () {
                    scope.$broadcast('setInputReady');
                });

            },
            template: '<div ng-repeat="row in rows()" class="grid__row"><div ng-repeat="column in columns()" class="grid__cell" ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(getCellHeight($parent.$index, $index)) }"><grid-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-cell></div></div><grid-active-cell ng-model="activeCellModel"></grid-active-cell><grid-input-reader></grid-input-reader>'
        };
    };

})(_);

if (module) {
    module.exports = window.gridDirective;
    delete window.gridDirective;
}
},{}],6:[function(require,module,exports){
(function () {
    'use strict';

    window.gridInputReaderDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element/*, attrs, ngModel*/) {
                scope.input = '';

                scope.$watch('input', function (newVal, oldVal) {
                    if (newVal !== oldVal && newVal.length > 0) {
                        scope.$broadcast('activateCellEditor', {
                            value: newVal
                        });

                        scope.input = '';
                    }
                });

                var focus = function () {
                    element.find('textarea')[0].focus();
                };

                scope.$watch('activeCellModel.row', focus);
                scope.$watch('activeCellModel.column', focus);
                scope.$on('setInputReady', focus);
            },
            template: '<textarea ng-model="input"></textarea>'
        };
    };

})();

if (module) {
    module.exports = window.gridInputReaderDirective;
    delete window.gridInputReaderDirective;
}
},{}]},{},[1])