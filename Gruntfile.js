module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            sources: {
                expand: true,
                cwd: 'src/',
                src: '**/*.js',
                dest: 'dist/',
                flatten: true,
                filter: 'isFile',
            },
        },
        screeps: {
            options: grunt.file.readJSON('screepslogin.json'),
            dist: {
                src: ['dist/**.js']
            }
        },
        clean: ['dist/']
    });

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['copy', 'screeps', 'clean']);
}