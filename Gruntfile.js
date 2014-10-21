/*global module:false*/
module.exports = function (grunt) {
    'use strict';

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

                         strip_code: {
                             options: {
                                 start_comment: 'test-code',
                                 end_comment: 'end-test-code'
                             },
                             build: {
                                 src: '<%= concat.dist.dest %>'
                             }
                         },

                         uglify: {
                             dist: {
                                 src: '<%= concat.dist.dest %>',
                                 dest: 'build/build.min.js'
                             }
                         },

                         jshint: {
                             options: {
                                 force: true,
                                 jshintrc: '.jshintrc'
                             },
                             lib: {
                                 src: 'js/**/*.js'
                             },
                             gruntfile: {
                                 src: 'Gruntfile.js'
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
                         },

                         release: {
                             options: {
                                 file: 'bower.json',
                                 npm: false
                             }
                         },

                         karma: {
                             unit: {
                                 configFile: './tests/karma.conf.js'
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
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-strip-code');

    // Default task.
    grunt.registerTask('default', ['jshint', 'karma', 'concat', 'strip_code', 'uglify', 'processhtml']);
};
