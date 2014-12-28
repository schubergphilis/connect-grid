(function (angular) {
    'use strict';

    angular.module('connect-store').service('registry', [function () {
        return function (Constructor, constructorOptions) {
            var cache = {};
            return function (id) {
                if (!cache[id]) {
                    cache[id] = new Constructor(angular.extend({}, {id: id}, constructorOptions));
                }
                return cache[id];
            };
        };
    }]);

}(window.angular));