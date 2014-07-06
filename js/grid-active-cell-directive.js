(function (_, keypress) {

    window.gridActiveCellDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {

                var keyBindingsListener = new keypress.Listener();

                var keyBindings = keyBindingsListener.register_many([
                    {
                        "keys"          : "right",
                        "on_keydown"    : function() {
                            scope.moveActiveCellRelative(0, 1);
                        }
                    },
                    {
                        "keys"          : "left",
                        "on_keydown"    : function() {
                            scope.moveActiveCellRelative(0, -1);
                        }
                    },
                    {
                        "keys"          : "up",
                        "on_keydown"    : function() {
                            scope.moveActiveCellRelative(-1, 0);
                        }
                    },
                    {
                        "keys"          : "down",
                        "on_keydown"    : function() {
                            scope.moveActiveCellRelative(1, 0);
                        }
                    },
                    {
                        "keys"          : "enter",
                        "on_keydown"    : function() {
                            scope.setActiveMode(true);
                        }
                    }
                ]);

                element.on('dblclick', function () {
                    scope.setActiveMode(true);
                });

                scope.isInEditMode = false;

                scope.setActiveMode = function (mode) {
                    scope.isInEditMode = mode;
                    if (mode) {
                        keyBindingsListener.stop_listening();
                    } else {
                        keyBindingsListener.listen();
                    }
                    scope.$apply();
                };

                scope.$on('activateCellEditor', function(event, e){
                    scope.setActiveMode(!scope.isInEditMode);
                });

                scope.moveActiveCellRelative = function (relativeDown, relativeRight) {
                    if (!scope.isInEditMode) {
                        scope.setActiveCell(ngModel.$modelValue.row + relativeDown, ngModel.$modelValue.column + relativeRight);
                        scope.$apply();
                        // todo: scroll element into view
                    }
                };

                scope.activeCellTop = function () {
                    var cell = scope.getCellCoordinates(ngModel.$modelValue.row, ngModel.$modelValue.column);
                    return cell.top + "px";
                };

                scope.activeCellLeft = function () {
                    var cell = scope.getCellCoordinates(scope.activeCellModel.row, scope.activeCellModel.column);
                    return cell.left + "px";
                };

                scope.activeCellWidth = function () {
                    var cell = scope.getCellCoordinates(ngModel.$modelValue.row, ngModel.$modelValue.column);
                    return cell.width + "px";
                };

                scope.activeCellHeight = function () {
                    var cell = scope.getCellCoordinates(ngModel.$modelValue.row, ngModel.$modelValue.column);
                    return cell.height + "px";
                };

                scope.activeCellValue = function () {
                    return scope.getCellValue(ngModel.$modelValue.row, ngModel.$modelValue.column);
                };

                scope.setCellValue = function (value) {
                    scope.updateCellValue(ngModel.$modelValue.row, ngModel.$modelValue.column, value);
                };

            },
            template: '<div class="grid__active-cell" ng-style="{ top: activeCellTop(), left: activeCellLeft(), width: activeCellWidth(), height: activeCellHeight() }"><grid-cell-editor/></div>'
        }
    };

})(_, keypress);