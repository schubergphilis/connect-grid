(function (angular, _) {
    'use strict';

    angular.module('connect-grid').directive('gridViewportSizeTracker', [function () {

        return {
            restrict: 'A',
            link: function (scope) {

                var broadcastResize = _.debounce(function () {
                    scope.$broadcast('grid-viewport-size-tracker.resize');
                }, 250);

                window.addEventListener('resize', function () {
                    broadcastResize();
                });

            }
        };
    }]);

})(window.angular, window._);