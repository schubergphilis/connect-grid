(function (angular) {
    'use strict';

    angular.module('connect-grid').service('GridStateStore', function () {

        var GridStateStore = function () {
            this.state = {};
        };

        GridStateStore.prototype = {
            setData: function (key, value) {
                this.state[key] = value;
            },
            getData: function (key) {
                return this.state[key];
            }
        };

        return GridStateStore;
    });

}(window.angular));