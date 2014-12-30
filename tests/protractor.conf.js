var browsers = {
    firefox: {
        name: 'Firefox',
        browserName: 'firefox'
    },
    chrome: {
        name: 'Chrome',
        browserName: 'chrome'
    },
    phantom: {
        name: 'Phantom',
        browserName: 'phantom'
    }
};

exports.config = {
    multiCapabilities: [
        browsers.chrome,
    ],

    specs: [
        './e2e/**/*.spec.js'
    ],

    baseUrl: 'http://localhost:63343'
};