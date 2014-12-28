(function (angular) {
    'use strict';

    angular.module('connect-grid').service('VirtualPagesStore', ['ConnectStore', 'VirtualPagesDispatcher', function (ConnectStore, VirtualPagesDispatcher) {
        var VirtualPagesStore = ConnectStore.extend(
            {
                dispatcherFactory: function () {
                    return new VirtualPagesDispatcher();
                },
                actions: {
                    slicePages: {
                        params: ['totalNumberOfEntries:Number'],
                        action: function (totalNumberOfEntries) {
                            this.items.splice(0, this.items.length);
                            for (var i = 0; i < totalNumberOfEntries / 5; i++) {
                                this.items.push({number: i});
                            }
                        }
                    }
                }
            }
        );

        return VirtualPagesStore;
    }]);

}(window.angular));