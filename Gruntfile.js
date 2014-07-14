/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        // Task configuration.
        concat: {
            dist: {
                src: [
                    'bower_components/Keypress/keypress.js',
                    'module.js',
                    'js/**/*.js'
                ],
                dest: 'build/build.js'
            }
        },
        uglify: {
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'build/build.min.js'
            }
        },
        jshint: {
            jshintrc: './jshintrc',
            lib: {
                src: 'js/**/*.js'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },

        processhtml: {
            bundle: {
                src: ['index.html'],
                dest: 'build/bundled.html'
            }
        },

        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'qunit']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-processhtml');

    // Default task.
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'processhtml']);
};
