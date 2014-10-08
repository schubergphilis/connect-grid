(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridCell', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs/*, ngModel */) {
                var customTpl = scope.getCompiledColumnCellTemplate(attrs.column);

                if (customTpl) {
                    element.find('span').replaceWith(customTpl(scope));
                }

                element.on('click', function () {
                    scope.setActiveCell(attrs.row, attrs.column);
                    scope.$apply();
                });
            },
            template: '<div class="grid__cell__content {{ getCellClass($parent.$index, $index) }}" ng-class="{ \'grid__cell--nonselectable\': !isColumnSelectable($index), \'grid__cell--noneditable\': !isColumnEditable($index) }" ng-style="{ height: px(gridOptions.headerCellHeight) }"><span class="ng-grid__cell__content-wrap">{{ renderCellContent($parent.$index, $index) }}</span></div>'
        };
    }]);

})(window.angular);