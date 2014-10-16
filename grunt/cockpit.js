module.exports = function(grunt, options) {

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-template');

    grunt.registerTask('cockpit:deploy', [
        'clean:cockpit-dist',
        'copy:cockpit-files',
        'template:cockpit-files'
    ]);

    return {
        tasks: {
            clean: {
                'cockpit-dist': [
                    'dist/cockpit/'
                ]
            },
            copy: {
                'cockpit-files': {
                    files: [
                        {
                            expand: true,
                            cwd: 'cockpit/',
                            src: ['**'],
                            dest: 'dist/cockpit/'
                        }
                    ]
                }
            },
            template: {
                'cockpit-files': {
                    'options': {
                        'data': {
                            'currentVersion': options.globalCameoBuildConfig.config.version,
                            'basePath': options.globalCameoBuildConfig.cockpit.basePath,
                            'appPath': options.globalCameoBuildConfig.cockpit.appPath
                        }
                    },
                    'files': {
                        'dist/cockpit/index.html': ['dist/cockpit/index.html']
                    }
                }
            }
        }
    }
};