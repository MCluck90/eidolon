module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

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
            jobs: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['jshint', 'nodeunit:jobs']
            },
            steps: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['jshint', 'nodeunit:steps']
            }
        },
        nodeunit: {
            all: ['test/**/*.js'],
            jobs: ['test/**/*job*.js'],
            steps: ['test/**/*step*.js']
        }
    });

    grunt.registerTask('default', 'watch');
};
