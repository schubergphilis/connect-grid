window.angular.module('connect-store', []);
(function (angular) {
    'use strict';

    angular.module('connect-store').service('ConnectDispatcher', ['$q',
        function ($q) {

            var Dispatcher = function () {
                this.callbacks = [];
                this._promises = [];
            };

            var _addPromise = function (callback, actionName, payload) {
                var deferred = $q.defer();

                if (callback(actionName, payload)) {
                    deferred.resolve(payload);
                } else {
                    deferred.reject(new Error('Dispatcher callback returned false result on action ' + actionName));
                }

                this._promises.push(deferred.promise);
            };

            var clearPromises = function () {
                this._promises = [];
            };

            Dispatcher.prototype = {
                register: function (callback) {
                    this.callbacks.push(callback);
                    return this.callbacks.length - 1;   // number (index of a callback)
                },
                dispatch: function (actionName, payload) {
                    var context = this;
                    this.callbacks.forEach(function (callback) {
                        _addPromise.call(context, callback, actionName, payload);
                    });
                    $q.all(this._promises).then(function () {
                        clearPromises.call(context);
                    });
                }
            };

            Dispatcher.extend = function (methods) {
                var NewDispatcher = function () {
                    Dispatcher.apply(this, arguments);
                };

                NewDispatcher.prototype = angular.extend({}, Dispatcher.prototype, methods);

                return NewDispatcher;
            };

            return Dispatcher;
        }]);

}(window.angular));
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
(function (angular) {
    'use strict';

    var validators = {
        'isBoolean': function(obj) {
            return obj === true || obj === false || Object.prototype.toString.call(obj) === '[object Boolean]';
        },
        isArray: angular.isArray,
        isDate: angular.isDate,
        isDefined: angular.isDefined,
        isElement: angular.isElement,
        isFunction: angular.isFunction,
        isNumber: angular.isNumber,
        isObject: angular.isObject,
        isString: angular.isString
    };

    angular.module('connect-store').service('actionsRegistrar', [function () {
        return {
            registerActionsInDispatcher: function (dispatcher, actions, context) {
                var keys = Object.keys(actions);

                dispatcher.register(function (actionName, payload) {
                    payload = payload || {};

                    if (keys.indexOf(actionName) > -1) {
                        var action = actions[actionName];

                        var parameterValues = [];

                        if (action.params) {
                            // validate params in payload:
                            action.params.forEach(function (param) {
                                var parts = String(param).split(':');
                                var paramName = parts[0];

                                // validate that the parameter is in the payload:
                                if (!(paramName in payload)) {
                                    throw Error('Required param `' + paramName + '` was not dispatched with action `' + actionName + '`');
                                }

                                if (parts.length > 1) {
                                    var paramType = parts[1];
                                    var validatorName = 'is' + paramType;

                                    // check if type is correct (correct type is any type that has angulat.isSomething
                                    if (!(validatorName in validators)) {
                                        throw Error('Unsupported param type ' + paramType + ' in the description of action ' + actionName);
                                    }

                                    // check is the value in the payload is
                                    if (!validators[validatorName](payload[paramName])) {
                                        throw Error('Payload parameter ' + paramName + ' for action ' + actionName + ' is not of type ' + paramType);
                                    }

                                }

                                // add parameter to action's call
                                parameterValues.push(payload[paramName]);
                            });
                        }

                        action.action.apply(context, parameterValues);

                        return true;
                    }

                    return false;
                });
            }
        };
    }]);

}(window.angular));
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