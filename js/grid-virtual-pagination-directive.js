(function (angular, _) {
    'use strict';

    var getGridHeight = function (scope) {
        var gridMaxHeight = scope.getGridMaxHeight();
        return gridMaxHeight === 'auto' ? window.screen.height : parseInt(gridMaxHeight);
    };

    angular.module('connect-grid').directive('gridVirtualPagination', [function () {
        return {
            restrict: 'E',
            scope: true,
            compile: function() {
                return {
                    pre: function (scope/*, element, attrs*/) {
                        var pages = [];

                        var buildPagesArray = function (pages) {
                            var rowsQty = scope.filteredRows.length;

                            var visibleGridHeight = getGridHeight(scope);
                            var rowHeight = scope.getCellHeight();

                            var rowsPerPage = Math.ceil(visibleGridHeight/rowHeight);   // todo: additional buffer
                            var numberOfPages = Math.ceil(rowsQty / rowsPerPage);

                            _.each(_.range(numberOfPages), function (index) {
                                var rowsOnThisPage = Math.min(rowsPerPage, rowsQty - index * rowsPerPage);
                                var startPx = index * rowsPerPage * rowHeight;
                                pages.push({
                                    page: index,
                                    startPx: startPx,
                                    endPx: startPx + rowsOnThisPage * rowHeight,
                                    rowsOnPage: rowsOnThisPage,
                                    rows: scope.filteredRows.slice(index * rowsPerPage, index * rowsPerPage + rowsOnThisPage)
                               });
                            });

                        };

                        scope.virtualPages = function () {
                            if (pages.length === 0) {
                                buildPagesArray(pages);
                            }
                            return pages;
                        };

                        scope.isVirtualPageVisible = function (virtualPage) {
                            var visibleGridHeight = getGridHeight(scope);

                            var viewport = {
                                top: scope.scrollTop,
                                bottom: scope.scrollTop + visibleGridHeight - 1
                            };

                            return (
                                virtualPage.startPx < viewport.bottom &&
                                virtualPage.endPx > viewport.top
                            );
                        };

                        scope.$on('grid-is-scrolling', function (event, value) {
                            if (value === false) {
                                scope.$digest();
                            }
                        });
                    }
                };
            },
            template: '<grid-virtual-page ng-repeat="virtualPage in virtualPages()" style="display: block; height: {{ virtualPage.rowsOnPage * getCellHeight() }}px;">\n    <div ng-if="isVirtualPageVisible(virtualPage)">\n        <grid-row ng-repeat="row in virtualPage.rows" class="grid__row" ng-class="getRowClass(row._rowIndex)">\n            <div ng-repeat="column in columns() track by $index" class="grid__cell"\n                 ng-style="{ width: px(getCellWidth(row._rowIndex, $index)), height: px(getCellHeight()) }">\n                <grid-cell row="{{ row._rowIndex }}" column="{{ $index }}"></grid-cell>\n            </div>\n        </grid-row>\n    \n        <grid-active-cell ng-model="activeCellModel"\n                          ng-class="{ \'grid-active-cell--is-active\': isReadingInput }"></grid-active-cell>\n        <grid-input-reader></grid-input-reader>\n    </div>\n</grid-virtual-page>'
        };
    }]);

})(window.angular, window._);