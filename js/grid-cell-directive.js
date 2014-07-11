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
            template: '<div class="grid__cell__content">{{ cellContent($parent.$index, $index) }}</div>'
        };
    };

})(window.keypress);