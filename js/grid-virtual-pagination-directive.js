(function (angular, _) {
    'use strict';

    var getGridHeight = function (scope) {
        var gridMaxHeight = scope.getGridMaxHeight();
        return gridMaxHeight === 'auto' ? window.screen.height : parseInt(gridMaxHeight);
    };

    var sliceRowsForPage = function (page, allRows) {
        return allRows.slice(page.page * page.rowsPerPage, page.page * page.rowsPerPage + page.rowsOnPage);
    };

    angular.module('connect-grid').directive('gridVirtualPagination', ['$rootScope', function ($rootScope) {
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
                            var rowHeight = scope.getFixedCellHeight();

                            var rowsPerPage = Math.ceil(visibleGridHeight * scope.gridOptions.virtualPagination.screenMultiplier / rowHeight);   // todo: additional buffer
                            var numberOfPages = Math.ceil(rowsQty / rowsPerPage);

                            _.each(_.range(numberOfPages), function (index) {
                                var rowsOnThisPage = Math.min(rowsPerPage, rowsQty - index * rowsPerPage);
                                var startPx = index * rowsPerPage * rowHeight;
                                var page = {
                                    page: index,
                                    rowsPerPage: rowsPerPage,
                                    startPx: startPx,
                                    endPx: startPx + rowsOnThisPage * rowHeight,
                                    rowsOnPage: rowsOnThisPage
                                };
                                page.rows = sliceRowsForPage(page, scope.filteredRows);
                                pages.push(page);
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
                                top: scope.scrollTop - scope.gridOptions.virtualPagination.viewportBufferZoneSizePx,
                                bottom: (scope.scrollTop + visibleGridHeight - 1) + scope.gridOptions.virtualPagination.viewportBufferZoneSizePx
                            };

                            return (
                                virtualPage.startPx < viewport.bottom &&
                                virtualPage.endPx > viewport.top
                            );
                        };

                        scope.scrollIntoView = function (obj) {
                            var index = -1;
                            var page = _.find(pages, function (page) {
                                index = _.indexOf(page.rows, obj);
                                return index > -1;
                            });

                            if (page) {
                                $rootScope.$broadcast('grid.update-scroll-position', {
                                    top: page.startPx + index * scope.getFixedCellHeight()
                                });
                            }
                        };

                        scope.$on('grid-is-scrolling', function (event, value) {
                            if (value === false) {
                                scope.$digest();
                            }
                        });

                        scope.$on('grid.reslice-virtual-pages', function (/*event*/) {
                            scope.filterRows();
                            pages.splice(0, pages.length);
                            buildPagesArray(pages);
                        });

                        scope.$on('grid.scroll-obj-into-view', function (e, data) {
                            scope.scrollIntoView(data.obj);
                        });
                    }
                };
            },
            template: '<grid-virtual-page ng-repeat="virtualPage in virtualPages()" class="grid-virtual-page" style="height: {{ virtualPage.rowsOnPage * getFixedCellHeight() }}px;">\n    <div ng-if="isVirtualPageVisible(virtualPage)">\n        <grid-row ng-repeat="row in virtualPage.rows" class="grid__row" ng-class="getRowClass(row._rowIndex)" row="{{ row._rowIndex }}" ng-if="!row._isDeleted">\n            <div ng-repeat="column in columns()" class="grid__cell"\n                 ng-style="{ width: px(getCellWidth(row._rowIndex, $index)), height: px(getFixedCellHeight()) }">\n                <grid-cell row="{{ row._rowIndex }}" column="{{ $index }}"></grid-cell>\n            </div>\n        </grid-row>\n    </div>\n</grid-virtual-page>'
        };
    }]);

})(window.angular, window._);