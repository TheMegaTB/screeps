module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            sources: {
                expand: true,
                cwd: 'src/',
                src: '**/*.js',
                dest: 'dist/',
                filter: 'isFile',
                rename: function (dest, src) {       // The value for rename must be a function
                    return dest + src.replace(/\//g, "."); // The function must return a string with the complete destination
                }
            },
        },
        screeps: {
            options: grunt.file.readJSON('screeps.json'),
            dist: {
                src: ['dist/**.js']
            }
        },
        clean: 'dist/'
    });

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['copy', 'screeps', 'clean']);
}