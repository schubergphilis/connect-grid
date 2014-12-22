(function (angular, window) {
    'use strict';

    var instances = {};

    angular.module('connect-grid').service('gridDispatcher', ['GridCollectionStore', 'GridStateStore', 'virtualPagesDispatcher',
        function (GridCollectionStore, GridStateStore, virtualPagesDispatcher) {

            var GridDispatcher = function (gridId) {
                this.gridId = gridId;

                // stores:
                this.gridStateStore = new GridStateStore();
                this.collectionStore = new GridCollectionStore();

                this.initialized = false;
            };

            GridDispatcher.prototype = {
                initialize: function (collection, options) {
                    if (this.initialized) {
                        throw 'Grid dispatcher with id ' + this.gridId + ' has already been initialized';
                    }
                    this.initialized = true;

                    // store data:
                    this.collectionStore.setData(collection);

                    this.action('set-visible-height', { maxHeight: options.maxHeight });
                    this.action('slice-virtual-pages');
                },
                action: function (actionName, actionData) {
                    switch (actionName) {
                        case 'slice-virtual-pages':
                            // delegate to further dispatchers:
                            virtualPagesDispatcher(this.gridId).action('slice-pages', {
                                totalNumberOfEntries: this.collectionStore.getData().length,
                                visibleGridHeight: this.getStateValue('visibleHeight'),
                                rowHeight: 26,
                                screenMultiplier: 1
                            });

                            break;

                        case 'set-visible-height':

                            var h = parseInt(actionData.maxHeight);
                            if (!h) {
                                h = window.screen.height;
                            }
                            this.gridStateStore.setData('visibleHeight', h);

                            break;
                    }
                },
                getCollectionStoreData: function () {
                    return this.collectionStore.getData();
                },
                getStateValue: function (key) {
                    return this.gridStateStore.getData(key);
                }
            };

            return function (gridId) {
                if (!(gridId in instances)) {
                    instances[gridId] = new GridDispatcher(gridId);
                }
                return instances[gridId];
            };
        }]);

}(window.angular, window));