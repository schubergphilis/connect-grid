(function (angular) {
    'use strict';


    angular.module('connect-grid').factory('gridInputParser', [function () {
        return {
            isTabularData: function (text) {
                return String(text).indexOf('\n') > -1 || String(text).indexOf('\t') > -1;
            },
            getRows: function (text) {
                return String(text).split('\n');
            },
            getColumns: function (text) {
                return String(text).split('\t');
            }
        };
    }]);


}(window.angular));