(function (angular) {
    'use strict';

    var actionsRegistrar;

    var Store = function (options) {
        this.options = options;

        this.items = [];
        this.state = {};

        if ('dispatcherFactory' in this) {
            this.dispatcher = this.dispatcherFactory();

            if ('actions' in this) {
                actionsRegistrar.registerActionsInDispatcher(this.dispatcher, this.actions, this);
            }
        }
    };

    Store.prototype = {
        getItems: function () {
            return this.items;
        },
        getState: function () {
            return this.state;
        }
    };

    Store.extend = function (properties) {
        var NewStore = function () {
            Store.apply(this, arguments);
        };

        NewStore.prototype = angular.extend({}, Store.prototype, properties);

        return NewStore;
    };

    angular.module('connect-store').service('ConnectStore', ['actionsRegistrar', function (_actionsRegistrar_) {
        actionsRegistrar = _actionsRegistrar_;
        return Store;
    }]);

}(window.angular));