(function (_, keypress) {

    function moveCaretToEnd(el) {
        if (typeof el.selectionStart == "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange != "undefined") {
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
                var textareaEl = jqLite.find("textarea")[0];

                return function (scope, element, attrs, ngModel) {
                    var keyBindingsListener = new window.keypress.Listener(textareaEl);

                    var keyBindings = keyBindingsListener.register_many([
                        {
                            "keys"          : "enter",
                            "on_keydown"    : function() {
                                scope.finishEditing();
                            }
                        },
                        {
                            "keys"          : "esc",
                            "on_keydown"    : function() {
                                scope.cancelEditing();
                            }
                        }
                    ]);

                    scope.value = "";
                    scope.isVisible = false;

                    scope.$watch('activeCellValue()', function (newVal) {
                        scope.value = newVal;
                    });

                    scope.$watch('isInEditMode', function (newVal) {
                        scope.isVisible = newVal;

                        if (newVal === true) {
                            $timeout(function () {
                                textareaEl.focus();
                                moveCaretToEnd(textareaEl);
                            });
                        }
                    });

                    scope.cancelEditing = function () {
                        scope.value = scope.activeCellValue();
                        scope.setActiveMode(false);
                    };

                    scope.finishEditing = function () {
                        scope.setCellValue(scope.value);
                        scope.setActiveMode(false);
                    };
                };
            },
            template: '<textarea ng-model="value" ng-show="isVisible">{{ activeCellValue() }}</textarea>'
        }
    }];

})(_, keypress);