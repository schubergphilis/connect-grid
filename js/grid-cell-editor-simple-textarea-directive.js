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

    angular.module('connect-grid').directive('gridCellEditorSimpleTextarea', [function () {
        return {
            restrict: 'E',
            link: function (scope, element) {
                var textareaEl = element.find('textarea')[0];

                scope.$on('finish-editing', function () {
                    textareaEl.blur();
                });

                element.find('textarea').on('blur', function () {
                    scope.confirmEditing();
                    scope.finishEditing();
                });

                scope.$on('editorFocus', function () {
                    textareaEl.focus();
                    moveCaretToEnd(textareaEl);
                });

            },
            template: '<textarea ng-model="value" ng-model-options="{ updateOn: \'blur\'}">{{ activeCellValue() }}</textarea>'
        };
    }]);

})(window.keypress, window.angular);