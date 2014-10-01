module.exports = function (grunt, options) {

    grunt.loadNpmTasks('grunt-protractor-runner');

    grunt.registerTask('tests-e2e', [
        'tests-e2e:prepare',
        'protractor:tier1',
        'protractor:tier2',
        'protractor:tier3'
    ]);
    grunt.registerTask('tests-e2e:tier1', [
        'tests-e2e:prepare',
        'protractor:tier1',
    ]);
    grunt.registerTask('tests-e2e:tier2', [
        'tests-e2e:prepare',
        'protractor:tier2',
    ]);
    grunt.registerTask('tests-e2e:tier3', [
        'tests-e2e:prepare',
        'protractor:tier3'
    ]);
    grunt.registerTask('tests-e2e:all', [
        'tests-e2e:prepare',
        'protractor:all',
    ]);
    grunt.registerTask('tests-e2e:prepare', [
        'test:generate-keys',
        'app:gen-all-templates',
        'app:js-files'
    ]);

    grunt.registerTask('tests-2e2', ['tests-e2e']);
    grunt.registerTask('tests-multi', [
        // we only need to generate templates for tests
        'template:config-tests',
        'template:config-protractor-multi',
        'protractor:default'
    ]);

    grunt.registerTask('protractor:config', [
        'template:config-protractor'
    ]);

    grunt.registerTask('protractor:e2e:config', [
        'template:config-tests'
    ]);

    return {
        tasks: {
            protractor: {
                options: {
                    configFile: "config/ptor.e2e.conf.js", // Default config file
                    keepAlive: false, // If false, the grunt process stops when the test fails.
                    noColor: false, // If true, protractor will not use colors in its output.
                    args: {
                        // Arguments passed to the command
                    },
                    debug: options.globalCameoTestConfig.config.protractorDebug
                },
                "all": {
                    options: {
                        "args": {
                            "specs": [
                                "test/e2e/**/*.spec.js"
                            ]
                        }
                    }
                },
                "tier1": {
                    options: {
                        "args": {
                            "specs": [
                                "test/e2e/**/*.1.spec.js"
                            ]
                        }
                    }
                },
                "tier2": {
                    options: {

                        "args": {
                            "specs": [
                                "test/e2e/**/*.2.spec.js"
                            ]
                        }
                    }
                },
                "tier3": {
                    options: {
                        "args": {
                            "specs": [
                                "test/e2e/**/*.3.spec.js"
                            ]
                        }
                    }
                }
            },
            template: {
                'config-protractor': {
                    'options': {
                        'data': {
                            'chromeDriverPath': options.globalCameoTestConfig.config.chromeDriverPath,
                            'capabilities': "capabilities:{'browserName':'chrome'}"
                        }
                    },
                    'files': {
                        'config/ptor.e2e.conf.js': ['resource/templates/test/ptor.e2e.conf.js']
                    }
                },
                'config-protractor-multi': {
                    'options': {
                        'data': {
                            'chromeDriverPath': options.globalCameoTestConfig.config.chromeDriverPath,
                            'capabilities': "multiCapabilities:[{'browserName': 'chrome'}, {'browserName': 'firefox'}]"
                        }
                    },
                    'files': {
                        'config/ptor.e2e.conf.js': ['resource/templates/test/ptor.e2e.conf.js']
                    }
                },
                'config-tests': {
                    'options': {
                        'data': {
                            'currentApiUrl': options.globalCameoBuildConfig.config.apiUrl,
                            'currentWwwUrl': options.globalCameoTestConfig.config.wwwUrl,
                            'stopOnError': options.globalCameoTestConfig.config.stopOnError || false,
                            'testData': "this." + options.globalCameoTestConfig.testData.join(";\nthis.") + ";"
                        }
                    },
                    'files': {
                        'test/e2e/config-e2e-tests.js': ['resource/templates/test/config-e2e.js']
                    }
                }
            }
        }
    }
};