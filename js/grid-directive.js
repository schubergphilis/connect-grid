(function (_) {
    'use strict';

    window.gridDirective = function () {
        var defaultOptions = {
            cellWidth: 70,
            cellHeight: 22,
            columns: {

            }
        };

        return {
            restrict: 'C',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if(!ngModel) {
                    return;     // do nothing if no ng-model
                }

                scope.gridOptions = _.extend({}, defaultOptions, scope.gridOptions);

                scope.rows = function () {
                    return _.range(ngModel.$modelValue.length);
                };

                scope.columns = function () {
                    return scope.gridOptions.columns;
                };

                scope.cellContent = function (row, col) {
                    var columns = scope.columns();
                    if (columns[col] && 'name' in columns[col]) {
                        return ngModel.$modelValue[row][columns[col].name];
                    }

                    return '';
                };

                scope.activeCellModel = {
                    row: 0,
                    column: 0
                };

                scope.getCellWidth = function (/* row, col */) {
                    return scope.gridOptions.cellWidth + 'px';
                };

                scope.getCellHeight = function (/* row, col */) {
                    return scope.gridOptions.cellHeight + 'px';
                };

                scope.getCellCoordinates = function (row, col) {
                    return {
                        top: row * scope.gridOptions.cellHeight,
                        left: col * scope.gridOptions.cellWidth,
                        width: scope.gridOptions.cellWidth,
                        height: scope.gridOptions.cellHeight
                    };
                };

                scope.getCellValue = function (row, col) {
                    var columns = scope.columns();
                    if (columns[col] && 'name' in columns[col]) {
                        return ngModel.$modelValue[row][columns[col].name];
                    }

                    return null;
                };

                scope.updateCellValue = function (row, col, value) {
                    var columns = scope.columns();
                    if (columns[col] && 'name' in columns[col]) {
                        ngModel.$modelValue[row][columns[col].name] = value;
                    }

                };

                scope.setActiveCell = function (row, col) {
                    scope.activeCellModel.row = Math.min(Math.max(row, 0), scope.rows().length - 1);
                    scope.activeCellModel.column = Math.min(Math.max(col, 0), scope.columns().length - 1);
                };

                element.on('click', function () {
                    scope.$broadcast('setInputReady');
                });

            },
            template: '<div ng-repeat="row in rows()" class="grid__row"><div ng-repeat="column in columns()" class="grid__cell" ng-style="{ width: getCellWidth($parent.$index, $index), height: getCellHeight($parent.$index, $index) }"><grid-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-cell></div></div><grid-active-cell ng-model="activeCellModel"></grid-active-cell><grid-input-reader></grid-input-reader>'
        };
    };

})(_);