module.exports = function(grunt, options){

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('app:concat-less', [
        'concat:app-less-files',
        'less:app-less-to-css'
    ]);

    grunt.registerTask('app:concat-css', [
        'concat:app-css'
    ]);

    grunt.registerTask('app:create-style-via-less', [
        'app:concat-less',
        'app:concat-css'
    ]);

    return {
        tasks:{
            concat: {
                'options': {
                    separator: '\n'
                },
                'app-less-files': {
                    src: [
                        'app/less/base.less',
                        'app/less/bootstrap.less',
                        'app/less/theme-a.less',
                        'app/less/!(base|bootstrap|theme-a).less'
                    ],
                    dest: 'app/css/app.less'
                },
                'app-css': {
                    src: [
                        'app/css/bootstrap.min.css',
                        'app/css/!(bootstrap).css',
                        'app/vendor/**/*.css'
                    ],
                    dest: 'app/style.' + options.globalCameoBuildConfig.config.version + '.css'
                }
            },
            less: {
                'app-less-to-css': {
                    options: {
                        yuicompress: true
                    },
                    files: {
                        'app/css/app.css': 'app/css/app.less'
                    }
                }
            }
        }
    }
};