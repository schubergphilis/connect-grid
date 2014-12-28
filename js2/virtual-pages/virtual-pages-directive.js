(function (angular, _) {
    'use strict';

    angular.module('connect-grid')
        .directive('virtualPages', [
                       'VirtualPagesStore', function (VirtualPagesStore) {

                           return {
                               restrict: 'E',
                               scope: {
                                   collection: '='
                               },
                               templateUrl: 'js2/virtual-pages/virtual-pages-directive.html',
                               compile: function compile() {

                                   var store = new VirtualPagesStore();

                                   return {
                                       pre: function (scope, element, attrs) {
                                           scope.virtualPages = store.getItems();

                                           store.dispatcher.dispatch('slicePages', {
                                               totalNumberOfEntries: scope.collection.length
                                           });
                                       }
                                   };
                               }
                           };
                       }]);
}(window.angular, window._));