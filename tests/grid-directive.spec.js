describe('grid-directive', function () {
    'use strict';

    var $compile;
    var $rootScope;
    var $timeout;

    var itemsCollection;

    beforeEach(module('connect-grid'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;

        itemsCollection = [];
    }));

    function addDummyData (collection) {
        collection.push({ name: 'test 1', age: 20});
        collection.push({ name: 'test 2', age: 22});
    }

    function dummyColumns () {
        return [
            { field: 'name' },
            { field: 'age' }
        ];
    }

    function runStandardPreparation() {
        $rootScope.myCollection = itemsCollection;
        addDummyData($rootScope.myCollection);
        $rootScope.myGridOptions = { columnDefs: dummyColumns()};
        var element = $compile('<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>')($rootScope);
        $rootScope.$digest();
        return element;
    }

    it('should show rows and columns', function () {
        var element = runStandardPreparation();

        expect(element[0].querySelectorAll('.grid__row').length).toBe(2);
        expect(element[0].querySelectorAll('.grid__cell__content').length).toBe(4);
        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content span')[0].innerHTML).toBe('test 1');
        expect(element[0].querySelectorAll('.grid__row')[1].querySelectorAll('.grid__cell__content span')[0].innerHTML).toBe('test 2');
        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content span')[1].innerHTML).toBe('20');
        expect(element[0].querySelectorAll('.grid__row')[1].querySelectorAll('.grid__cell__content span')[1].innerHTML).toBe('22');
    });

    it('should start editing the cell on event trigger', function () {
        var element = runStandardPreparation();

        $rootScope.$broadcast('grid.start-cell-edit', {
            obj: $rootScope.myCollection[1],
            field: 'age'
        });

        // first column editor is hidden:
        expect(element[0].querySelectorAll('grid-cell-editor span')[0].className).toBe('ng-hide');
        // second column editor is visible:
        expect(element[0].querySelectorAll('grid-cell-editor span')[1].className).toBe('');
        expect(element[0].querySelectorAll('grid-cell-editor span')[1].querySelector('textarea').value).toBe('22');
    });

    it('should clear the cell on backspace key', function () {
        runStandardPreparation();

        var backspaceCombo = window._.find(window.keyBindingsListener._registered_combos, function (combo) {
            return combo.keys.length === 1 && combo.keys[0] === 'backspace';
        });

        backspaceCombo.on_keydown();

        expect($rootScope.myCollection[0].name).toBe('');
    });

});