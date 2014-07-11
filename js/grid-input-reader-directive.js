(function (_, keypress) {

    window.gridInputReaderDirective = function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.input = '';

                scope.$watch('input', function (newVal, oldVal) {
                    if (newVal !== oldVal && newVal.length > 0) {
                        scope.$broadcast('activateCellEditor', {
                            value: newVal
                        });

                        scope.input = '';
                    }
                });

                var focus = function () {
                    element.find('textarea')[0].focus();
                };

                scope.$watch('activeCellModel.row', focus);
                scope.$watch('activeCellModel.column', focus);
                scope.$on('setInputReady', focus)
            },
            template: '<textarea ng-model="input"></textarea>'
        }
    };

})(_, keypress);