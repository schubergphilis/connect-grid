(function () {
    'use strict';

    window.gridInputReaderDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element/*, attrs, ngModel*/) {
                scope.input = '';

                scope.$watch('input', function (newVal, oldVal) {
                    if (newVal !== oldVal && newVal.length > 0) {
                        scope.$broadcast('activateCellEditor', {
                            value: newVal
                        });

                        scope.input = '';
                    }
                });

                scope.$watch('scope.activeCellModel', function (newVal, oldVal) {

                });

                var focus = function () {
                    element.find('textarea')[0].focus();
                };

                scope.$watch('activeCellModel.row', focus);
                scope.$watch('activeCellModel.column', focus);
                scope.$on('setInputReady', focus);
            },
            template: '<textarea ng-model="input"></textarea>'
        };
    };

})();

if (typeof exports === 'object') {
    module.exports = window.gridInputReaderDirective;
    delete window.gridInputReaderDirective;
}