module.exports = function(grunt, options){

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-template');

    grunt.registerTask('nw:create-webworker', [
        'clean:nw-webworker',
        'template:nw-desktop-webworker',
        'copy:nw-webworker-mock-vendor'
    ]);

    var webworker   =   [
            'rsa_keygen',
            'rsa_decrypt',
            'rsa_encrypt',
            'rsa_sign',
            'rsa_verify'
        ],
        files       =   webworker.map(function(job_name){
            var path    = 'dist/nodeWebkit/webworker/'+job_name+'.js',
                object  = {}

            object[path] =  [
                'core/webworker/'+job_name+'.js'
            ]
            return object
        })


    return {
        tasks:{
            clean: {
                'nw-webworker': ['dist/nodeWebkit/webworker']
            },

            copy: {
                'nw-webworker-mock-vendor': {
                    files: [
                        {
                            expand: true,
                            flatten: true,
                            src: ['core/webworker/-mock-vendor.js'],
                            dest: 'dist/nodeWebkit/webworker/'
                        }
                    ]
                }
            },
            template: {
                'nw-desktop-webworker': {
                    'options': {
                        'data': {
                            'currentVersion': options.globalCameoBuildConfig.config.version
                        }
                    },
                    'files': files
                }
            }
        }
    }
};