(function () {
    'use strict';

    window.gridHeaderCellDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs/*, ngModel */) {
                element.on('click', function () {
                    scope.setActiveCell(attrs.row, attrs.column);
                    scope.$apply();
                });
            },
            template: '<div class="grid__header-cell__content">{{ renderCellHeader($index) }}</div>'
        };
    };

})(window.keypress);

if (typeof exports === 'object') {
    module.exports = window.gridCellDirective;
    delete window.gridCellDirective;
}