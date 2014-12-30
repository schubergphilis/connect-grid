describe('connect-grid', function () {
    'use strict';

    describe('index', function () {
        it('should display the correct title', function () {
            // in the video, I used the protractor.getInstance() which was removed shortly thereafter in favor of this browser approach
            browser.get('/connect-grid/index.html');
            expect(browser.getTitle()).toBe('hello protractor');
        });
    });
});