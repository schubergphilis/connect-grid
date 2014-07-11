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

                scope.$watch('activeCellModel', function (newVal) {
                    element.find('textarea')[0].value = scope.getCellValue(newVal.row, newVal.column);
                    select();
                }, true);

                var select = function () {
                    element.find('textarea')[0].select();
                };

                scope.$on('setInputReady', select);
            },
            template: '<textarea ng-model="input"></textarea>'
        };
    };

})();

if (typeof exports === 'object') {
    module.exports = window.gridInputReaderDirective;
    delete window.gridInputReaderDirective;
}