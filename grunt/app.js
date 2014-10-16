module.exports = function(grunt, options) {

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-template');

    grunt.registerTask('app:copy-core', [
        'clean:app-dist',
        'copy:app-core'
    ]);

    return {
        tasks: {
            clean: {
                'app-dist': [
                    'dist/app/'
                ]
            },
            copy: {
                'app-core': {
                    files: [
                        {
                            expand: true,
                            cwd: 'core/gfx/',
                            src: ['**'],
                            dest: 'dist/app/gfx/'
                        },
                        {
                            expand: true,
                            cwd: 'core/i18n/',
                            src: ['**'],
                            dest: 'dist/app/i18n/'
                        },
                        {
                            expand: true,
                            flatten: true,
                            cwd: 'core/css/fonts/',
                            src: ['**'],
                            dest: 'dist/app/css/fonts'
                        },
                        {
                            src: 'core/favicon.ico',
                            dest: 'dist/app/favicon.ico'
                        }
                    ]
                }
            },
            template: {
                'app-files': {
                    'options': {
                        'data': {
                            'currentVersion': options.globalCameoBuildConfig.config.version,
                            'currentApiUrl': options.globalCameoBuildConfig.config.apiUrl,
                            'autoLogin': options.globalCameoBuildConfig.config.autoLogin,
                            'loadingBar': options.globalCameoBuildConfig.config.loadingBar,
                            'enableDebug': options.globalCameoBuildConfig.config.enableDebug,
                            'performancePage': options.globalCameoBuildConfig.config.performancePage,
                            'phonegapFiles': options.globalCameoBuildConfig.debug.weinre ? '<script src="http://' + options.globalCameoBuildConfig.debug.weinreIp + ':8080/target/target-script-min.js#anonymous"></script>' : '',
                            'phonegapOnload': ''
                        }
                    },
                    'files': {
                        'dist/app/index.html': ['app/index.html'],
                        'dist/app/icons.html': ['core/icons.html'],
                        'build/app/base/config.js': ['app/base/config.js'],
                        // performance page
                        'dist/app/performance.html': ['core/performance.html']
                    }
                }
            }
        }
    }
};