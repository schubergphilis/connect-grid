describe('grid-directive', function () {
    'use strict';

    var $compile;
    var $rootScope;

    var itemsCollection;

    beforeEach(module('connect-grid'));

    beforeEach(inject(function(_$compile_, _$rootScope_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        itemsCollection = [];
    }));

    it('should show rows and columns', function () {
        $rootScope.myCollection = itemsCollection;

        $rootScope.myCollection.push({ name: 'test 1', age: 20});
        $rootScope.myCollection.push({ name: 'test 2', age: 22});

        $rootScope.myGridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'age' }
            ]
        };

        var element = $compile('<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>')($rootScope);
        $rootScope.$digest();

        expect(element[0].querySelectorAll('.grid__row').length).toBe(2);
        expect(element[0].querySelectorAll('.grid__cell__content').length).toBe(4);
        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content span')[0].innerHTML).toBe('test 1');
        expect(element[0].querySelectorAll('.grid__row')[1].querySelectorAll('.grid__cell__content span')[0].innerHTML).toBe('test 2');
        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content span')[1].innerHTML).toBe('20');
        expect(element[0].querySelectorAll('.grid__row')[1].querySelectorAll('.grid__cell__content span')[1].innerHTML).toBe('22');
    });

});