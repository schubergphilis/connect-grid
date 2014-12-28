(function (angular) {
    'use strict';

    angular.module('connect-grid').service('VirtualPagesDispatcher', [
        'ConnectDispatcher',
        function (ConnectDispatcher) {
            return ConnectDispatcher.extend({});
        }]);

}(window.angular));