(function (angular) {
    'use strict';


    angular.module('connect-grid').directive('gridHeaderCell', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs/*, ngModel */) {
                element.on('click', function () {
                    scope.setActiveCell(attrs.row, attrs.column);
                });
            },
            template: '<div class="grid__header-cell__content">{{ renderCellHeader($index) }}</div>'
        };
    }]);

})(window.angular);