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