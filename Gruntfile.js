module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-nodeunit');
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
                    src: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
                }
            }
        },
        watch: {
            all: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['jshint', 'nodeunit']
            },
            nodeunit: {
                files: ['src/**/*.js', 'test/nodeunit/**/*.js'],
                tasks: ['jshint', 'nodeunit']
            },
            mocha: {
                files: ['src/**/*.js', 'test/mocha/**/*.js'],
                tasks: ['jshint', 'simplemocha']
            }
        },
        nodeunit: {
            all: ['test/nodeunit/**/*.js']
        },
        simplemocha: {
            options: {
                timeout: 25000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },

            all: {
                src: ['test/mocha/**/*.js']
            }

        }
    });

    grunt.registerTask('default', 'watch');
};
