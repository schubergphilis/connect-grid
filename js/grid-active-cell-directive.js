(function (_, keypress) {

    window.gridActiveCellDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {

                var listener = new window.keypress.Listener();

                var my_combos = listener.register_many([
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
                    }
                ]);

                scope.$watch('testValue', function (newVal) {
                    console.log("testValue", newVal);
                });

                scope.moveActiveCellRelative = function (relativeDown, relativeRight) {
                    scope.setActiveCell(ngModel.$modelValue.row + relativeDown, ngModel.$modelValue.column + relativeRight);
                    scope.$apply();
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

            },
            template: '<div class="grid__active-cell" ng-style="{ top: activeCellTop(), left: activeCellLeft(), width: activeCellWidth(), height: activeCellHeight() }"></div>'
        }
    };

})(_, keypress);