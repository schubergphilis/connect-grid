(function (angular, _) {
    'use strict';

    angular.module('connect-grid').directive('gridScrollTracker', [function () {

        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element/*, attrs*/) {

                var onScrollStart = function () {
                    scope.setGridIsScrolling(true);
                };

                var startScroll = _.once(onScrollStart);

                var updateScopeOnScroll = _.debounce(function () {
                    scope.setGridIsScrolling(false);
                    startScroll = _.once(onScrollStart);
                }, 250);

                if (element.length > 0) {
                    element.on('scroll', function () {
                        scope.setGridScrollLeft(element[0].scrollLeft);
                        scope.setGridScrollTop(element[0].scrollTop);

                        startScroll();
                        updateScopeOnScroll();
                    });
                }
            }
        };
    }]);

})(window.angular, window._);