(function (_) {

    window.gridDirective = function () {
        var defaultOptions = {
            cellWidth: 70,
            cellHeight: 22
        };

        return {
            restrict: 'C',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if(!ngModel) return; // do nothing if no ng-model

                scope.gridOptions = _.extend({}, defaultOptions, scope.gridOptions);

                scope.rows = function () {
                    return _.range(ngModel.$modelValue.length);
                };
                scope.columns = function () {
                    if (ngModel.$modelValue.length > 0) {
                        return _.keys(ngModel.$modelValue[0]);
                    } else {
                        return [];
                    }
                };

                scope.cellContent = function (row, col) {
                    return ngModel.$modelValue[row][scope.columns()[col]];
                };

                scope.activeCellModel = {
                    row: 0,
                    column: 0
                };

                scope.getCellWidth = function (row, col) {
                    return scope.gridOptions.cellWidth + "px";
                };

                scope.getCellHeight = function (row, col) {
                    return scope.gridOptions.cellHeight + "px";
                };

                scope.getCellCoordinates = function (row, col) {
                    return {
                        top: row * scope.gridOptions.cellHeight,
                        left: col * scope.gridOptions.cellWidth,
                        width: scope.gridOptions.cellWidth,
                        height: scope.gridOptions.cellHeight
                    }
                };

                scope.getCellValue = function (row, col) {
                    return ngModel.$modelValue[row][scope.columns()[col]];
                };

                scope.updateCellValue = function (row, col, value) {
                    ngModel.$modelValue[row][scope.columns()[col]] = value;
                };

                scope.setActiveCell = function (row, col) {
                    scope.activeCellModel.row = Math.min(Math.max(row, 0), scope.rows().length - 1);
                    scope.activeCellModel.column = Math.min(Math.max(col, 0), scope.columns().length - 1);
                };

            },
            template: '<div ng-repeat="row in rows()" class="grid__row"><div ng-repeat="column in columns()" class="grid__cell" ng-style="{ width: getCellWidth($parent.$index, $index), height: getCellHeight($parent.$index, $index) }"><div class="grid__cell__content">{{ cellContent($parent.$index, $index) }}</div></div></div><grid-active-cell ng-model="activeCellModel" />'
        }
    };

})(_);