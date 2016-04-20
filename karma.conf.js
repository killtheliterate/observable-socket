module.exports = function (config) {
    config.set({
        autoWatch: false,
        basePath: '',
        browserify: {
            debug: true,
        },
        browsers: ['Chrome', 'Firefox', 'Safari', 'Opera'],
        colors: true,
        concurrency: Infinity,
        files: [
            'dist/*.js',
            'test/browser/index.js',
        ],
        frameworks: ['browserify', 'mocha'],
        logLevel: config.LOG_INFO,
        port: 9876,
        preprocessors: {
            'dist/*.js': [ 'browserify' ],
            'test/browser/index.js': [ 'browserify' ],
        },
        reporters: ['progress'],
        singleRun: false,
    })
}
