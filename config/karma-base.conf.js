module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // frameworks to use
        frameworks: ['jasmine', 'requirejs'],

        // list of files / patterns to load in the browser
        files: [
//            {pattern: 'app/languages/*.jsons', included: false, served: true, autoWatch: true},
            {pattern: 'app/js/**/*.js', included: false},
            {pattern: 'test/unit/**/*.spec.js', included: false},
            {pattern: 'test/lib/**/*.js', included: false},
            // included true!!! requirejs wrapper
            {pattern: 'test/unit/test.main.js', included: true}
        ],

        // list of files to exclude
        exclude: [
            'app/js/**/main.js'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress'],

        // the default configuration
        junitReporter: {
            outputFile: 'target/test-reports/test-results.xml',
            suite: ''
        },

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};