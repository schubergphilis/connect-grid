(function (angular) {
    'use strict';

    var instances = {};

    angular.module('connect-grid').service('virtualPagesDispatcher', [
        'VirtualPagesStore',
        'virtualPagesSliceAction',
        function (VirtualPagesStore, virtualPagesSliceAction, gridDispatcher) {

            var VirtualPagesDispatcher = function (gridId) {
                this.gridId = gridId;

                // stores:
                this.virtualPagesStore = new VirtualPagesStore();
            };

            VirtualPagesDispatcher.prototype = {
                action: function (actionName, actionData) {
                    switch (actionName) {
                        case 'slice-pages':
                            var pages = virtualPagesSliceAction(
                                actionData.totalNumberOfEntries,
                                actionData.visibleGridHeight,
                                actionData.rowHeight,
                                actionData.screenMultiplier
                            );
                            this.virtualPagesStore.setData(pages);
                    }
                },
                getCollectionStoreData: function () {
                    return this.collectionStore.getData();
                }
            };

            return function (gridId) {
                if (!(gridId in instances)) {
                    instances[gridId] = new VirtualPagesDispatcher(gridId);
                }
                return instances[gridId];
            };
        }]);

}(window.angular));