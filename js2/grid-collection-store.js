(function (angular) {
    'use strict';

    angular.module('connect-grid').service('GridCollectionStore', function () {

        var GridCollectionStore = function () {
            this.collection = [];
        };

        GridCollectionStore.prototype = {
            setData: function (newCollection) {
                angular.copy(newCollection, this.collection);
            },
            getData: function () {
                return this.collection;
            }
        };

        return GridCollectionStore;
    });

}(window.angular));