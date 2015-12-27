// Karma configuration
// Generated on Sat Dec 26 2015 17:36:36 GMT-0700 (MST)

module.exports = function(config) {
  config.set({
    autoWatch: false,
    basePath: '',
    browserify: {
        debug: true,
    },
    browsers: ['Chrome'],
    colors: true,
    concurrency: Infinity,
    files: [
        'dist/*.js',
        'test/browser/index.js'
    ],
    frameworks: ['browserify', 'mocha'],
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
        'dist/*.js': [ 'browserify' ],
        'test/browser/index.js': [ 'browserify' ],
    },
    reporters: ['spec'],
    singleRun: true,
  })
}
