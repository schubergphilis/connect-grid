(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('activeCellHint', [function () {
        return {
            restrict: 'E',
            scope: true,
            link: function (scope, element) {
                scope.activeCellBottom = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return cell.top + scope.gridOptions.activeCellModifiers.top + cell.height - scope.scrollTop;
                };

                scope.activeCellLeft = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);

                    var leftPosition = cell.left + scope.gridOptions.activeCellModifiers.left - scope.scrollLeft;
                    var hintWidth = element[0].getElementsByClassName('active-cell-hint')[0].offsetWidth;
                    var hintRightBorder = leftPosition + hintWidth;
                    var maxRightBorder = scope.getDimensionsLimiterWidth();

                    if (hintRightBorder > maxRightBorder) {
                        leftPosition -= hintRightBorder - maxRightBorder;
                    }

                    return leftPosition;
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

                // expose column() to the template:
                scope.column = function () {
                    return scope.columns()[scope.activeCellModel.column];
                };

                // expose row() to the template:
                scope.row = function () {
                    return scope.getRow(scope.activeCellModel.row);
                };

                scope.$on('active-cell-set', function () {
                    if (!scope.$$phase) {
                        scope.$digest();
                    }
                });

                scope.$on('grid-is-scrolling', function () {
                    if (!scope.$$phase) {
                        scope.$digest();
                    }
                });

            },
            template: '<div class="active-cell-hint" ng-style="{ top: px(activeCellBottom()), left: px(activeCellLeft())}"><div ng-if="isHintVisible()" ng-include="hintTemplateSrc()"></div> </div>'
        };
    }]);

})(window.angular);