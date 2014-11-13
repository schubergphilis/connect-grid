(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridCell', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs/*, ngModel */) {
                var customTpl = scope.getCompiledColumnCellTemplate(attrs.column);

                if (customTpl) {
                    scope.isCustomTpl = true;
                    element.append(customTpl(scope));
                } else {
                    scope.isCustomTpl = false;
                }

                element.on('click', function () {
                    scope.setActiveCell(attrs.row, attrs.column);
                });
            },
            template: '<div\n     ng-if="!isCustomTpl && !rowIsChangedSinceRender"\n     class="grid__cell__content {{ ::getCellClass($parent.$parent.$index, $parent.$index) }}"\n     ng-class="{ \'grid__cell--nonselectable\': {{::!isColumnSelectable($index)}}, \'grid__cell--noneditable\': {{::!isColumnEditable($index)}} }"\n     ng-style="{ height: \'{{ ::gridOptions.headerCellHeight}}px\' }">\n    <span class="ng-grid__cell__content-wrap">\n        {{ ::renderCellContent($parent.$parent.$index, $parent.$index) }}\n    </span>\n</div>\n<div\n    ng-if="!isCustomTpl && rowIsChangedSinceRender"\n    class="grid__cell__content {{ getCellClass($parent.$parent.$index, $parent.$index) }}"\n    ng-class="{ \'grid__cell--nonselectable\': !isColumnSelectable($index), \'grid__cell--noneditable\': !isColumnEditable($index) }"\n    ng-style="{ height: \'{{ gridOptions.headerCellHeight}}px\' }">\n    <span class="ng-grid__cell__content-wrap">\n        {{ renderCellContent($parent.$parent.$index, $parent.$index) }}\n    </span>\n</div>'
        };
    }]);

})(window.angular);