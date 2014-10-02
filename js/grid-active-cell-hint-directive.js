(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('activeCellHint', [function () {
        return {
            restrict: 'E',
            scope: true,
            link: function (scope, element, attrs) {
                scope.activeCellBottom = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return cell.top + scope.gridOptions.activeCellModifiers.top + cell.height - scope.scrollTop;
                };

                scope.activeCellLeft = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return cell.left + scope.gridOptions.activeCellModifiers.left - scope.scrollLeft;
                };

                scope.isHintVisible = function () {
                    return !scope.isScrolling && scope.getIfHintVisible(scope.activeCellModel.row, scope.activeCellModel.column);
                };

                scope.hintTemplateSrc = function () {
                    return scope.getHintTemplateSrc(scope.activeCellModel.row, scope.activeCellModel.column);
                };

                // expose value() to the template:
                scope.value = function () {
                    return scope.getCellValue(scope.activeCellModel.row, scope.activeCellModel.column);
                };

                // expose row() to the template:
                scope.row = function () {
                    return scope.getRow(scope.activeCellModel.row);
                };

            },
            template: '<div class="active-cell-hint" ng-style="{ top: px(activeCellBottom()), left: px(activeCellLeft())}"><div ng-if="isHintVisible()" ng-include="hintTemplateSrc()"></div> </div>'
        };
    }]);

})(window.angular);