(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridCell', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs/*, ngModel */) {
                var customTpl = scope.getCompiledColumnCellTemplate(attrs.column);

                scope.cellIsChangedSinceRender = false;

                scope.$on('cell-value-changed-' + scope.$parent.$index + '-' + scope.$index, function () {
                    scope.cellIsChangedSinceRender = true;
                });

                if (customTpl) {
                    element.find('span').replaceWith(customTpl(scope));
                }

                element.on('click', function () {
                    scope.setActiveCell(attrs.row, attrs.column);
                });
            },
            template: '<div class="grid__cell__content {{ getCellClass($parent.$index, $index) }}"\n     ng-class="{ \'grid__cell--nonselectable\': !isColumnSelectable($index), \'grid__cell--noneditable\': !isColumnEditable($index) }"\n     ng-style="{ height: px(gridOptions.headerCellHeight) }">\n    <span class="ng-grid__cell__content-wrap">\n        <span ng-if="cellIsChangedSinceRender">{{ renderCellContent($parent.$parent.$index, $parent.$index) }}</span>\n        <span ng-if="!cellIsChangedSinceRender">{{ ::renderCellContent($parent.$parent.$index, $parent.$index) }}</span>\n    </span>\n</div>'
        };
    }]);

})(window.angular);