require('./bower_components/Keypress/keypress');

var gridDirective = require('./js/grid-directive');
var gridCellDirective = require('./js/grid-cell-directive');
var gridHeaderCellDirective = require('./js/grid-header-cell-directive');
var gridInputReaderDirective = require('./js/grid-input-reader-directive');
var gridActiveCellDirective = require('./js/grid-active-cell-directive');
var gridCellEditorDirective = require('./js/grid-cell-editor-directive');

window.angular.module('connect-grid', [])
    .directive('grid', gridDirective)
    .directive('gridCell', gridCellDirective)
    .directive('gridHeaderCell', gridHeaderCellDirective)
    .directive('gridActiveCell', gridActiveCellDirective)
    .directive('gridCellEditor', gridCellEditorDirective)
    .directive('gridInputReader', gridInputReaderDirective);