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