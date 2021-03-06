module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: {
                files: {
                    src: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
                }
            }
        },
        watch: {
            all: {
                files: ['lib/**/*.js', 'test/**/*.js'],
                tasks: ['jshint', 'simplemocha']
            }
        },
        simplemocha: {
            options: {
                timeout: 15000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },

            all: {
                src: ['test/**/*.js']
            }

        }
    });

    grunt.registerTask('default', 'watch');
};
