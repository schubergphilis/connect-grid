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

    angular.module('connect-grid').directive('gridCellEditorSimpleTextarea', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                var textareaEl = element.find('textarea')[0];

                element.find('textarea').on('blur', function () {
                    scope.confirmEditing();
                    scope.finishEditing();
                });

                scope.$on('editorFocus', function () {
                    textareaEl.focus();
                    moveCaretToEnd(textareaEl);
                });

            },
            template: '<textarea ng-model="value">{{ activeCellValue() }}</textarea>'
        };
    }]);

})(window.keypress, window.angular);