describe('grid-directive', function () {
    'use strict';

    var $compile;
    var $rootScope;
    var $timeout;
    var $httpBackend;

    var itemsCollection;

    beforeEach(module('connect-grid'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$httpBackend_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $httpBackend = _$httpBackend_;

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
        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content span span')[0].innerHTML).toBe('test 1');
        expect(element[0].querySelectorAll('.grid__row')[1].querySelectorAll('.grid__cell__content span span')[0].innerHTML).toBe('test 2');
        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content span span')[1].innerHTML).toBe('20');
        expect(element[0].querySelectorAll('.grid__row')[1].querySelectorAll('.grid__cell__content span span')[1].innerHTML).toBe('22');
    });

    it('should start editing the cell on event trigger', function () {
        var element = runStandardPreparation();

        $rootScope.$broadcast('grid.start-cell-edit', {
            obj: $rootScope.myCollection[1],
            field: 'age'
        });

        $timeout.flush();

        // first column editor is hidden:
        expect(element[0].querySelectorAll('grid-cell-editor span')[0].className).toBe('ng-hide');
        // second column editor is visible:
        expect(element[0].querySelectorAll('grid-cell-editor span')[1].className).toBe('');
        expect(element[0].querySelectorAll('grid-cell-editor span')[1].querySelector('textarea').value).toBe('22');
    });

    it('should start editing the cell on event trigger with pre-set data', function () {
        var element = runStandardPreparation();

        $rootScope.$broadcast('grid.start-cell-edit', {
            obj: $rootScope.myCollection[1],
            field: 'age',
            value: 100
        });

        $timeout.flush();

        // first column editor is hidden:
        expect(element[0].querySelectorAll('grid-cell-editor span')[0].className).toBe('ng-hide');
        // second column editor is visible:
        expect(element[0].querySelectorAll('grid-cell-editor span')[1].className).toBe('');
        expect(element[0].querySelectorAll('grid-cell-editor span')[1].querySelector('textarea').value).toBe('100');
    });

    it('should clear the cell on backspace key', function () {
        runStandardPreparation();

        var backspaceCombo = window._.find(window.keyBindingsListener._registered_combos, function (combo) {
            return combo.keys.length === 1 && combo.keys[0] === 'backspace';
        });

        backspaceCombo.on_keydown();

        expect($rootScope.myCollection[0].name).toBe('');
    });

    it('should skip the unselectable columns when navigating', function () {
        $rootScope.myCollection = itemsCollection;
        addDummyData($rootScope.myCollection);
        var columns = dummyColumns();
        columns[1].selectable = false;
        columns.push({
            renderer: function () {
                return 'test 3';
            }
        });
        $rootScope.myGridOptions = { columnDefs: columns};
        var element = $compile('<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>')($rootScope);
        $rootScope.$digest();

        var rightArrowCombo = window._.find(window.keyBindingsListener._registered_combos, function (combo) {
            return combo.keys.length === 1 && combo.keys[0] === 'right';
        });

        var leftArrowCombo = window._.find(window.keyBindingsListener._registered_combos, function (combo) {
            return combo.keys.length === 1 && combo.keys[0] === 'left';
        });

        expect(element[0].querySelector('grid-input-reader textarea').value).toBe('test 1');

        rightArrowCombo.on_keydown();

        expect(element[0].querySelector('grid-input-reader textarea').value).toBe('test 3');

        leftArrowCombo.on_keydown();

        expect(element[0].querySelector('grid-input-reader textarea').value).toBe('test 1');
    });

    it('should show custom hint on an active cell', function () {
        $rootScope.myCollection = itemsCollection;
        addDummyData($rootScope.myCollection);
        var columns = dummyColumns();
        columns[0].isHintVisible = function () {
            return true;
        };
        columns[0].hintTemplateSrc = function () {
            return 'custom-template.html';
        };

        $httpBackend.whenGET('custom-template.html').respond('<div>test hint msg</div>');

        $rootScope.myGridOptions = { columnDefs: columns};
        var element = $compile('<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>')($rootScope);
        $rootScope.$digest();

        $httpBackend.flush();

        expect(element[0].querySelector('.active-cell-hint div').innerHTML).toBe('<div class="ng-scope">test hint msg</div>');
    });

    it('should support custom cell classes', function () {
        $rootScope.myCollection = itemsCollection;
        addDummyData($rootScope.myCollection);
        var columns = dummyColumns();
        columns[0].cellClass = 'custom-class';
        columns[1].cellClass = function (value, row, rowIndex, colIndex) {
            return [value, row.name, rowIndex, colIndex].join('-');
        };
        $rootScope.myGridOptions = { columnDefs: columns};
        var element = $compile('<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>')($rootScope);
        $rootScope.$digest();

        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content')[0].className).toBe('grid__cell__content custom-class');
        expect(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content')[1].className).toBe('grid__cell__content 20-test 1-0-1');
        expect(element[0].querySelectorAll('.grid__row')[1].querySelectorAll('.grid__cell__content')[1].className).toBe('grid__cell__content 22-test 2-1-1');
    });

    it('should support custom value resolutions on active cell', function () {
        $rootScope.myCollection = itemsCollection;
        addDummyData($rootScope.myCollection);
        var columns = dummyColumns();
        columns[0].valueResolver = function (value) {
            if (String(value).length === 0) {
                return '(empty)';
            } else {
                return value;
            }
        };
        $rootScope.myGridOptions = { columnDefs: columns};
        $compile('<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>')($rootScope);
        $rootScope.$digest();

        var backspaceCombo = window._.find(window.keyBindingsListener._registered_combos, function (combo) {
            return combo.keys.length === 1 && combo.keys[0] === 'backspace';
        });

        expect($rootScope.myCollection[0].name).toBe('test 1');
        backspaceCombo.on_keydown();
        expect($rootScope.myCollection[0].name).toBe('(empty)');
    });

    it('should support custom templates for cell rendering', function () {
        $rootScope.myCollection = itemsCollection;
        addDummyData($rootScope.myCollection);
        var columns = dummyColumns();
        columns[0].cellTemplate = '<span>... {{ renderCellContent($parent.$index, $index) }} ...</span>';
        $rootScope.myGridOptions = { columnDefs: columns};
        var element = $compile('<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>')($rootScope);
        $rootScope.$digest();

        expect(String(element[0].querySelectorAll('.grid__row')[0].querySelectorAll('.grid__cell__content')[0].innerHTML).trim()).toBe('<span class="ng-binding ng-scope">... test 1 ...</span>');
    });
});