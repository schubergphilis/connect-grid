(function (angular, _) {
    'use strict';

    var counter = 0;

    var createUUID = function () {
        return ++counter;
    };

    var defaultOptions = {
        maxHeight: null
    };

    angular.module('connect-grid')
        .directive('connectGrid', ['gridDispatcher', function (gridDispatcher) {

                       return {
                           restrict: 'E',
                           scope: {
                               'collection': '=ngModel',
                               'options': '=gridOptions'
                           },
                           templateUrl: 'js2/grid-directive.html',
                           compile: function compile() {
                               return {
                                   pre: function (scope, element, attrs) {
                                       scope.gridId = createUUID();

                                       scope.options = _.extend({}, defaultOptions, scope.options);

                                       gridDispatcher(scope.gridId).initialize(scope.collection, scope.options);
                                   }
                               };
                           }
                       };
                   }]);
}(window.angular, window._));