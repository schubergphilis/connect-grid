(function (angular) {
    'use strict';


    angular.module('connect-grid').factory('gridInputParser', [function () {
        return {
            isTabularData: function (text) {
                return String(text).indexOf('\n') > -1 || String(text).indexOf('\t') > -1;
            },
            getRows: function (text) {
                var result = String(text).split('\n');

                //remove last row, if it is empty
                if (result.length > 0 && String(result[result.length - 1]).trim().length === 0) {
                    result.pop();
                }

                return result;
            },
            getColumns: function (text) {
                return String(text).split('\t');
            }
        };
    }]);


}(window.angular));