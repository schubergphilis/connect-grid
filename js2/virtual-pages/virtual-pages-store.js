(function (angular) {
    'use strict';

    angular.module('connect-grid').service('VirtualPagesStore', function () {

        var VirtualPagesStore = function () {
            this.collection = [];
        };

        VirtualPagesStore.prototype = {
            setData: function (newCollection) {
                angular.copy(newCollection, this.collection);
            },
            getData: function () {
                return this.collection;
            }
        };

        return VirtualPagesStore;
    });

}(window.angular));