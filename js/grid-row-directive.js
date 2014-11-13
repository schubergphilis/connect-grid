(function (angular) {
    'use strict';

    angular.module('connect-grid').directive('gridRow', [function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope) {
                scope.rowIsChangedSinceRender = false;

                scope.$on('row-cell-value-changed-' + scope.$index, function () {
                    scope.rowIsChangedSinceRender = true;
                });
            }
        };
    }]);

})(window.angular);