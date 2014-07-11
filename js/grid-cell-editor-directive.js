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

if (typeof exports === 'object') {
    module.exports = window.gridCellEditorDirective;
    delete window.gridCellEditorDirective;
}