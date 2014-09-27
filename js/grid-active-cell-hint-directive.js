(function (angular, keypress) {
    'use strict';

    angular.module('connect-grid').directive('activeCellHint', [function () {
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                scope.activeCellBottom = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return cell.top + scope.gridOptions.activeCellModifiers.top;
                };

                scope.activeCellLeft = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return cell.left + scope.gridOptions.activeCellModifiers.left;
                };

            },
            template: '<div class="active-cell-hint" ng-style="{ top: px(activeCellBottom()), left: px(activeCellLeft())}">test</div>'
        };
    }]);

})(window.angular, window.keypress);