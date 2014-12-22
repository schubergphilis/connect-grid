(function (angular, _) {
    'use strict';

    /**
     * @param {Number} totalNumberOfEntries
     * @param {Number} visibleGridHeight
     * @param {Number} rowHeight
     * @param {Number} screenMultiplier
     *
     * @return {Array} list of pages
     */
    function virtualPagesSliceAction(totalNumberOfEntries, visibleGridHeight, rowHeight, screenMultiplier) {

        var rowsPerPage = Math.ceil(visibleGridHeight * screenMultiplier / rowHeight);
        var numberOfPages = Math.ceil(totalNumberOfEntries / rowsPerPage);

        var r = [];

        _.each(_.range(numberOfPages), function (index) {
            var rowsOnThisPage = Math.min(rowsPerPage, totalNumberOfEntries - index * rowsPerPage);
            var startingIndex = index * rowsPerPage;
            var startPx = index * rowsPerPage * rowHeight;
            var page = {
                page: index,
                rowsPerPage: rowsPerPage,
                startPx: startPx,
                endPx: startPx + rowsOnThisPage * rowHeight,
                rowsOnPage: rowsOnThisPage
            };
            page.rowIndex = function (rowIndex) {
                return startingIndex + rowIndex;
            };
            r.push(page);
        });

        return r;

    }

    angular.module('connect-grid').service('virtualPagesSliceAction', function () {
        return virtualPagesSliceAction;
    });

}(window.angular, window._));