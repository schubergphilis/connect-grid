(function (angular, _) {
    'use strict';

    angular.module('connect-grid')
        .directive('connectGrid', ['$compile', '$timeout', function ($compile, $timeout) {
                       var defaultOptions = {
                           activeCellKeyBindings: {},
                           activeCellModifiers: {
                               top: 0,
                               left: 0,
                               width: 0,
                               height: 0
                           },
                           cellWidth: 70,
                           cellHeight: 26,
                           columnDefs: [],
                           defaultEditableCellTemplate: '<grid-cell-editor-simple-textarea></grid-cell-editor-simple-textarea>',
                           editable: true,
                           headerCellHeight: 26,
                           maxHeight: null,
                           maxWidth: null,
                           selectable: true,
                           virtualPagination: {
                               screenMultiplier: 1,    // the bigger this value is, the more rows are in the virtual page
                               viewportBufferZoneSizePx: 0 // the bigger the value is, the sooner invisible pages will be put into dom on scrolling
                           },
                           // default methods:
                           filterRows: function (/* row, rowIndex, scope */) {
                               return true;
                           },
                           getRowClass: function (/*obj, index*/) {
                               /* function to get a custom class of a row */
                           },
                           onCellValueBulkChange: function (/* row, column, newValue, oldValue */) {
                               /* function to get a single change in the existing row, done in the process of bulk paste  */
                           },
                           onCellValueChange: function (/* row, column, newValue, oldValue */) {
                               /* function to get a single change in the existing row */
                           },
                           onExistingRowsPaste: function (/* rows */) {
                               /* function to get all the changes in the existing rows from the last paste operation */
                           },
                           onNewRowPaste: function (/* columnValues */) {
                               /* function to get a new row from the last paste operation */
                           },
                           onNewRowsPaste: function (/* rows */) {
                               /* function to get all the new rows from the last paste operation */
                           },
                           onRowSelect: function (/* object */) {

                           }
                       };

                       return {
                           restrict: 'E',
                           scope: true,
                           compile: function compile() {
                               return {
                                   pre: function (scope, element, attrs) {

                                       // private structures:

                                       var collection = scope.$eval(attrs.ngModel);
                                       var gridOptions = scope.$eval(attrs.gridOptions);

                                       // define structures on scope:

                                       scope.activeCellModel = {
                                           row: 0,
                                           column: 0
                                       };

                                       scope.filteredRows = [];
                                       scope.gridOptions = _.extend({}, defaultOptions, gridOptions);

                                       scope.isInEditMode = false;      // true, if any of the cell editors in this grid are active now
                                       scope.isReadingInput = false;    // true, if this grid has focus now
                                       scope.isScrolling = false;       // true, when grid is in the middle of scrolling by user

                                       scope.scrollLeft = 0;
                                       scope.scrollTop = 0;

                                       // define methods on scope:

                                       scope.addRow = function (rows, index) {
                                           collection.splice.apply(collection, [].concat(index, 0, rows));
                                           _.each(rows, function (row) {
                                               row._isNew = true;
                                           });
                                           scope.$broadcast('grid.reslice-virtual-pages');
                                       };

                                       scope.broadcastInputReady = function () {
                                           scope.$broadcast('grid-input-ready');
                                       };

                                       scope.columns = function () {
                                           return scope.gridOptions.columnDefs;
                                       };

                                       scope.deleteRow = function (obj) {
                                           obj._isDeleted = true;
                                           scope.$broadcast('grid.reslice-virtual-pages');
                                       };

                                       scope.filterRows = function () {
                                           var filteredRows = _.filter(collection, function (row, index) {
                                               // we don't want virtually deleted rows
                                               return !row._isDeleted && scope.gridOptions.filterRows(row, index, scope);
                                           });

                                           scope.filteredRows.splice.apply(scope.filteredRows, [].concat(0, scope.filteredRows.length, filteredRows));
                                           scope.filterRowsRebuildIndexes();
                                       };

                                       scope.filterRowsRebuildIndexes = function () {
                                           _.each(scope.filteredRows, function (row, index) {
                                               if ('setRowIndex' in row) {
                                                   row.setRowIndex(index);
                                               } else {
                                                   row['_rowIndex'] = index;
                                               }
                                           });
                                       };

                                       scope.getCellClass = function (row, col) {
                                           var columns = scope.columns();
                                           if (columns[col] && 'cellClass' in columns[col]) {
                                               if (_.isFunction(columns[col].cellClass)) {
                                                   var value = scope.getCellValue(row, col);
                                                   return columns[col].cellClass(value, scope.getRow(row), row, col, scope);
                                               } else {
                                                   return columns[col].cellClass;
                                               }
                                           }

                                           return null;
                                       };

                                       scope.getCellCoordinates = function (row, col) {
                                           var left, top;

                                           var firstCellInRow = element[0].querySelector('grid-cell[row=\'' + row + '\']');

                                           if (firstCellInRow && 'offsetTop' in firstCellInRow){
                                               // if cell is found in DOM, take offset calculated by the browser:
                                               top = firstCellInRow.offsetTop;
                                           } else {
                                               // if cell is not found in DOM, calculate the offset based on
                                               // the row number and fixed row height
                                               // (can be inaccurate on zoom level other than 1)

                                               top = 0;

                                               for (var i = 0; i < row; i++) {
                                                   top += scope.getCellHeight(i);
                                               }

                                               top += scope.gridOptions.headerCellHeight;
                                           }

                                           // left is calculated dynamically (no bugs reported so far)
                                           left = 0;
                                           for (var j = 0; j < col; j++) {
                                               left += scope.getCellWidth(row, j);
                                           }

                                           return {
                                               top: top,
                                               left: left,
                                               width: scope.getCellWidth(row, col),
                                               height: scope.getCellHeight(row, col)
                                           };
                                       };

                                       scope.getCellHeight = function (row) {
                                           var obj = scope.getRow(row);
                                           if (obj) {
                                               return obj._isDeleted ? 0 : scope.gridOptions.cellHeight;
                                           } else {
                                               return 0;
                                           }
                                       };

                                       scope.getCellValue = function (row, col) {
                                           var columns = scope.columns();
                                           if (scope.filteredRows[row] && columns[col] && 'field' in columns[col]) {
                                               return scope.filteredRows[row][columns[col].field];
                                           }

                                           return null;
                                       };

                                       scope.getCellWidth = function (row, col) {
                                           var columns = scope.columns();
                                           if (columns[col] && 'width' in columns[col]) {
                                               return columns[col].width;
                                           }
                                           return scope.gridOptions.cellWidth;
                                       };

                                       /**
                                        * @param {number} columnToSelect
                                        * @param {number} currentColumn
                                        */
                                       scope.getClosestSelectableColumn = function (columnToSelect, currentColumn) {
                                           var dir = currentColumn > columnToSelect ? -1 : +1;
                                           var i, l;

                                           if (dir === 1) {
                                               for (i = columnToSelect, l = scope.columns().length; i < l; i += 1) {
                                                   if (scope.isColumnSelectable(i)) {
                                                       return i;
                                                   }
                                               }
                                           } else {
                                               for (i = columnToSelect; i > -1; i -= 1) {
                                                   if (scope.isColumnSelectable(i)) {
                                                       return i;
                                                   }
                                               }
                                           }

                                           return currentColumn;
                                       };

                                       scope.getColIndex = function (col) {
                                           return _.indexOf(scope.columns(), col);
                                       };

                                       scope.getColumnByFieldName = function (columnName) {
                                           return _.findWhere(scope.columns(), { field: columnName});
                                       };

                                       scope.getColumnName = function (col) {
                                           var column = scope.columns()[col];
                                           if ('field' in column) {
                                               return column.field;
                                           }
                                       };

                                       scope.getCompiledColumnCellTemplate = function (col) {
                                           var column = scope.columns()[col];
                                           if ('cellTemplate' in column) {
                                               return $compile(column.cellTemplate);
                                           }
                                       };

                                       scope.getCompiledColumnEditorTemplate = function (col) {
                                           var column = scope.columns()[col];
                                           if ('editableCellTemplate' in column) {
                                               return $compile(column.editableCellTemplate);
                                           } else {
                                               return $compile(scope.gridOptions.defaultEditableCellTemplate);
                                           }
                                       };

                                       scope.getDimensionsLimiterWidth = function () {
                                           return element[0].getElementsByClassName('grid__dimensions-limiter')[0].offsetWidth;
                                       };

                                       scope.getFixedCellHeight = function () {
                                           return scope.gridOptions.cellHeight;
                                       };

                                       scope.getGridMaxHeight = function () {
                                           if (scope.gridOptions.maxHeight === null) {
                                               return 'auto';
                                           } else {
                                               return scope.px(scope.gridOptions.maxHeight);
                                           }
                                       };

                                       scope.getGridMaxWidth = function () {
                                           if (scope.gridOptions.maxWidth === null) {
                                               return 'auto';
                                           } else {
                                               return scope.px(scope.gridOptions.maxWidth);
                                           }
                                       };

                                       scope.getHintTemplateSrc = function (row, col) {
                                           var columns = scope.columns();

                                           if (columns[col] && 'hintTemplateSrc' in columns[col]) {
                                               var value = scope.getCellValue(row, col);
                                               var obj = scope.getRow(row);

                                               return columns[col].hintTemplateSrc(value, obj, row, col, scope);
                                           }
                                       };

                                       scope.getIfHintVisible = function (row, col) {
                                           var columns = scope.columns();

                                           if (columns[col] && 'isHintVisible' in columns[col]) {
                                               var value = scope.getCellValue(row, col);
                                               var obj = scope.getRow(row);
                                               return columns[col].isHintVisible(value, obj, row, col, scope);
                                           }

                                           return false;
                                       };

                                       scope.getRow = function (row) {
                                           return scope.filteredRows[row];
                                       };

                                       scope.getRowClass = function (row) {
                                           return scope.gridOptions.getRowClass(scope.getRow(row), row);
                                       };

                                       scope.getRowIndex = function (obj) {
                                           return _.indexOf(scope.filteredRows, obj);
                                       };

                                       scope.getTotalWidth = function () {
                                           var width = 0;
                                           var columns = scope.columns();
                                           _.each(columns, function (column, index) {
                                               width += scope.getCellWidth(0, index);
                                           });
                                           return width;
                                       };

                                       scope.isColumnEditable = function (col) {
                                           var column = scope.columns()[col];
                                           if (column && 'editable' in column) {
                                               return Boolean(column.editable);
                                           }
                                           return true;
                                       };

                                       scope.isColumnSelectable = function (col) {
                                           var column = scope.columns()[col];
                                           if (column && 'selectable' in column) {
                                               return Boolean(column.selectable);
                                           }
                                           return true;
                                       };

                                       scope.px = function (value) {
                                           return value + 'px';
                                       };

                                       scope.readingInputStarted = function () {
                                           scope.$broadcast('is-reading-input-change', true);
                                       };

                                       scope.readingInputStopped = function () {
                                           scope.$broadcast('is-reading-input-change', false);
                                       };

                                       scope.renderCellContent = function (row, col) {
                                           var value = scope.getCellValue(row, col);

                                           var columns = scope.columns();
                                           if (columns[col] && 'renderer' in columns[col]) {
                                               return columns[col].renderer(value, scope.getRow(row), row, col, scope);
                                           }

                                           return _.isUndefined(value) ? '' : value;
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

                                       scope.resetActiveCell = function () {
                                           scope.setActiveCell(scope.activeCellModel.row, scope.activeCellModel.column);
                                       };

                                       scope.resolveFieldValue = function (row, col, value) {
                                           var columns = scope.columns();

                                           if (columns[col] && 'field' in columns[col]) {
                                               if ('valueResolver' in columns[col]) {
                                                   var obj = row !== null ? scope.getRow(row) : null;
                                                   value = columns[col].valueResolver(value, obj, row, col, scope);
                                               }
                                           }

                                           return value;
                                       };

                                       scope.rows = function () {
                                           return _.range(scope.filteredRows.length);
                                       };

                                       scope.setActiveCell = function (row, col) {
                                           var rowIndex = Math.min(Math.max(row, 0), scope.filteredRows.length - 1);
                                           var columnIndex = Math.min(Math.max(col, 0), scope.columns().length - 1);

                                           if (!scope.isColumnSelectable(columnIndex)) {
                                               columnIndex = scope.getClosestSelectableColumn(columnIndex, scope.activeCellModel.column);
                                           }

                                           scope.activeCellModel.row = rowIndex;
                                           scope.activeCellModel.column = columnIndex;

                                           scope.$broadcast('active-cell-set');

                                           scope.broadcastInputReady();
                                       };

                                       scope.setGridActiveMode = function (isInEditMode) {
                                           scope.isInEditMode = isInEditMode;
                                       };

                                       scope.setGridIsReadingInput = function (isReadingInput) {
                                           scope.isReadingInput = isReadingInput;
                                       };

                                       scope.setGridIsScrolling = function (value) {
                                           scope.isScrolling = value;
                                           scope.$broadcast('grid-is-scrolling', value);
                                       };

                                       scope.setGridScrollLeft = function (scrollLeft) {
                                           scope.scrollLeft = scrollLeft;
                                       };

                                       scope.setGridScrollTop = function (scrollTop) {
                                           scope.scrollTop = scrollTop;
                                       };

                                       scope.updateCellValue = function (row, col, value) {
                                           var columns = scope.columns();
                                           if (columns[col] && 'field' in columns[col]) {
                                               var resolvedValue = scope.resolveFieldValue(row, col, value);
                                               scope.filteredRows[row][columns[col].field] = resolvedValue;

                                               $timeout(function () {
                                                   scope.$broadcast('row-cell-value-changed-' + row, {
                                                       newValue: resolvedValue
                                                   });
                                               });

                                               return resolvedValue;
                                           }
                                       };


                                       //
                                       // Subscribe to events and add watchers:
                                       //


                                       scope.$on('grid.collection-length-changed', function (e, data) {
                                           if ('collection' in data && data.collection === collection) {
                                               scope.$broadcast('grid.reslice-virtual-pages');
                                           }
                                       });

                                       scope.$on('grid.add-rows', function (e, data) {
                                           if ('collection' in data && data.collection === collection) {
                                               scope.addRow(data.objects, data.index);
                                               scope.filterRows();
                                           }
                                       });

                                       scope.$on('grid.delete-row', function (e, data) {
                                           if ('collection' in data && data.collection === collection) {
                                               scope.deleteRow(data.obj);
                                               scope.filterRows();
                                           }
                                       });

                                       scope.$on('grid.mark-all-rows-as-changed', function (e, data) {
                                           if ('collection' in data && data.collection === collection) {
                                               var rows = scope.rows();
                                               _.each(rows, function (row, index) {
                                                   scope.$broadcast('row-cell-value-changed-' + index);
                                               });
                                           }
                                       });

                                       scope.$on('grid.reset-active-cell', function (event, data) {
                                           if ('collection' in data && data.collection === collection) {
                                               if (!scope.isInEditMode) {
                                                   if (data.force || !scope.isReadingInput) {
                                                       scope.resetActiveCell();
                                                   }
                                               }
                                           }
                                       });

                                       scope.$on('grid.start-cell-edit', function (event, data) {
                                           if ('collection' in data && data.collection === collection) {
                                               if ('obj' in data && 'field' in data) {
                                                   var row = scope.getRowIndex(data.obj);

                                                   if (row !== -1 && row > -1) {
                                                       var column = scope.getColumnByFieldName(data.field);

                                                       if (column) {
                                                           var col = scope.getColIndex(column);

                                                           scope.setActiveCell(row, col);

                                                           var activateData = {};

                                                           if ('value' in data) {
                                                               activateData.value = data.value;
                                                           }

                                                           scope.$broadcast('activateCellEditor', activateData);
                                                       }
                                                   }
                                               }
                                           }
                                       });

                                       scope.$watch(attrs.ngModel + '.length', function () {
                                           scope.$broadcast('grid.collection-length-changed', { collection: collection });
                                       });

                                       scope.$watch('activeCellModel.row', function (newVal) {
                                           scope.gridOptions.onRowSelect(scope.getRow(newVal));
                                       });

                                   },
                                   post: function (scope, element/*, attrs*/) {
                                       scope.filterRows();

                                       element.on('click', function () {
                                           scope.broadcastInputReady();
                                       });

                                   }
                               };
                           },
                           template: '<div class="grid__wrap">\n    <div class="grid__dimensions-limiter" grid-scroll-tracker grid-viewport-size-tracker ng-style="{\'max-width\': getGridMaxWidth(), \'max-height\': getGridMaxHeight()}">\n        <div class="grid__cells-total-dimensions" ng-style="{width: px(getTotalWidth())}">\n            <div class="grid__headers-container" ng-style="{height: px(gridOptions.headerCellHeight)}">\n                <div ng-repeat="column in columns()" class="grid__header-cell"\n                     ng-style="{ width: px(getCellWidth($parent.$index, $index)), height: px(gridOptions.headerCellHeight) }">\n                    <grid-header-cell row="{{ $parent.$index }}" column="{{ $index }}"></grid-header-cell>\n                </div>\n            </div>\n            <div class="grid__rows-container">\n                <grid-virtual-pagination></grid-virtual-pagination>\n\n                <grid-active-cell ng-model="activeCellModel"\n                                  ng-class="{ \'grid-active-cell--is-active\': isReadingInput }"></grid-active-cell>\n                <grid-input-reader></grid-input-reader>\n            </div>\n        </div>\n    </div>\n    <cell-hints>\n        <active-cell-hint></active-cell-hint>\n    </cell-hints>\n</div>'
                       };
                   }]);
})(window.angular, window._);