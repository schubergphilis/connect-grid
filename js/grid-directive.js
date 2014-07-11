(function (_) {
    'use strict';

    window.gridDirective = function () {
        var defaultOptions = {
            cellWidth: 70,
            cellHeight: 26,
            headerCellHeight: 26,
            columnDefs: {

            },
            activeCellModifiers: {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            },
            onCellValueChange: function (row, column, newValue, oldValue) {

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
                    return scope.gridOptions.columnDefs;
                };

                scope.getRow = function (row) {
                    return ngModel.$modelValue[row];
                };

                scope.getColumnName = function (col) {
                    var column = scope.columns()[col];
                    if ('field' in column) {
                        return column.field;
                    }
                };

                scope.activeCellModel = {
                    row: 0,
                    column: 0
                };

                scope.px = function (value) {
                    return value + 'px';
                };

                scope.getCellWidth = function (row, col) {
                    var columns = scope.columns();
                    if (columns[col] && 'width' in columns[col]) {
                        return columns[col].width;
                    }
                    return scope.gridOptions.cellWidth;
                };

                scope.getCellHeight = function (/* row, col */) {
                    return scope.gridOptions.cellHeight;
                };

                scope.getCellCoordinates = function (row, col) {
                    var left = 0;
                    for (var i = 0; i < col; i++) {
                        left += scope.getCellWidth(row, i);
                    }

                    return {
                        top: row * scope.gridOptions.cellHeight + scope.gridOptions.headerCellHeight,
                        left: left,
                        width: scope.getCellWidth(row, col),
                        height: scope.getCellHeight(row, col)
                    };
                };

                scope.getCellValue = function (row, col) {
                    var columns = scope.columns();
                    if (columns[col] && 'field' in columns[col]) {
                        return ngModel.$modelValue[row][columns[col].field];
                    }

                    return null;
                };

                scope.renderCellContent = function (row, col) {
                    var value = scope.getCellValue(row, col);

                    var columns = scope.columns();
                    if (columns[col] && 'renderer' in columns[col]) {
                        return columns[col].renderer(value, scope.rows[row], row, col);
                    }

                    return value || '';
                };

                scope.renderCellHeader = function (col) {
                    var columns = scope.columns();
                    if (columns[col] && 'displayName' in columns[col]) {
                        return columns[col].displayName;
                    }
                    if (columns[col] && 'field' in columns[col]) {
                        return columns[col].field;
                    }
                    return '';
                };

                scope.updateCellValue = function (row, col, value) {
                    var columns = scope.columns();
                    if (columns[col] && 'field' in columns[col]) {
                        ngModel.$modelValue[row][columns[col].field] = value;
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
            template: '<div ng-repeat="column in columns()" class="grid__header-cell" ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(gridOptions.headerCellHeight) }"><grid-header-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-header-cell></div><div ng-repeat="row in rows()" class="grid__row"><div ng-repeat="column in columns()" class="grid__cell" ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(getCellHeight($parent.$index, $index)) }"><grid-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-cell></div></div><grid-active-cell ng-model="activeCellModel"></grid-active-cell><grid-input-reader></grid-input-reader>'
        };
    };

})(_);

if (typeof exports === 'object') {
    module.exports = window.gridDirective;
    delete window.gridDirective;
}