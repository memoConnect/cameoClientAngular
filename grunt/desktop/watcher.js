module.exports = function(grunt, options){

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('desktop:watcher', [
        'desktop:deploy-without-template',

        'desktop:gen-all-templates',

        'concurrent:desktop'
    ]);

    return {
        tasks:{
            concurrent: {
                options: {
                    logConcurrentOutput: true
                },
                desktop: {
                    tasks: [
                        'watch:desktop-other',
                        'watch:desktop-css',
                        'watch:desktop-js'
                    ]
                }
            },
            watch: {
                'desktop-other':{
                    files: [
                        'config/*.json',
                        'resource/templates/**/*',
                        'desktop/**/*.html'
                    ],
                    tasks: [
                        'desktop:gen-all-templates'
                    ]
                },
                'desktop-css':{
                    files: [
                        'core/less/!(_old)/**/*.less',
                        'core/less/*.less',
                        'desktop/less/**/*.less'
                    ],
                    tasks: [
                        'desktop:create-style-via-less'
                    ]
                },
                'desktop-js':{
                    files: [
                        'desktop/base/app.js',
                        'core/comps/**/*',
                        'core/widgets/**/*',
                        'core/vendor/**/*',
                        'desktop/routes/**/*',
                        'desktop/comps/**/*',
                        'desktop/widgets/**/*'
                    ],
                    tasks: [
                        'desktop:packages'
                    ]
                }
            }
        }
    }
};