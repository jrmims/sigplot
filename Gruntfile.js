'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        bower: {
            dev: {
                dest: ".",
                options: {
                    expand: true,
                    keepExpandedHierarchy: false,
                    packageSpecific: {
                        "jquery": {
                            files: [
                                "jquery.min.js"
                            ]
                        },
                        "bootstrap": {
                            files: [
                                "dist/js/bootstrap.min.js",
                                "dist/css/bootstrap.min.css",
                                "dist/css/bootstrap-theme.min.css",
                                "dist/fonts/*"
                            ]
                        },
                        "opentip": {
                            files: [
                                "lib/opentip.js",
                                "lib/adapter-jquery.js",
                                "css/opentip.css",
                                "css/stylus/*"
                            ]
                        }
                    }
                }
            }
        },
        shell: {
            make_examples: {
                command: "make -C examples"
            },
            bower_install: {
                command: "bower install"
            }
        },
        run_grunt: {
            sigplot_dev: {
                src: ["../sigplot/Gruntfile.js"]
            },
            sigplot_doc: {
                task: "jsdoc",
                src: ["../sigplot/Gruntfile.js"]
            }
        },
        copy: {
            sigplot_dev: {
                files: [
                    {   expand: true,
                        cwd: "../sigplot/dist",
                        src: ["sigplot.js"],
                        dest: "html/sigplot/",
                        rename: function(dest, src) {
                            return dest + src.replace('.js', '-minimized.js');
                        }
                    },
                    {   expand: true,
                        cwd: "../sigplot/dist",
                        src: ["sigplot.plugins.js"],
                        dest: "html/sigplot/",
                        rename: function(dest, src) {
                            return dest + src.replace('.js', '-minimized.js');
                        }
                    }
                ]
            },
            sigplot_doc: {
                files: [
                    {   expand: true,
                        cwd: "../sigplot",
                        src: ["doc/**"],
                        dest: "html"
                    }
                ]
            },
        },
        web_server: {
            options: {
                cors: true,
                nevercache: true,
                logRequests: true
            },
            foo: 'bar' // necessary for some odd reason, see the docs
        },
        clean: {
            build: ["html/examples/*.html", "html/bootstrap", "html/sigplot", "html/jquery"],
        },
        jsbeautifier: {
            check: {
                // Only check a subset of the files
                src: [
                        'html/examples/raw/*.html',
                ],
                options: {
                    mode: "VERIFY_ONLY"
                }
            },
            cleanup: {
                // Only cleanup a subset of the files
                src: [
                        'html/examples/raw/*.html',
                ],
                options: {
                    indentSize: 4,
                    indentWithTabs: false,
                    wrapLineLength: 0
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-web-server');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-run-grunt');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('build', ['shell:bower_install', 'bower', 'jsbeautifier:check', 'shell:make_examples']);
    
    grunt.registerTask('devbuild', ['build', 'run_grunt:sigplot_dev', 'copy:sigplot_dev']);
    
    grunt.registerTask('doc', ['run_grunt:sigplot_doc', 'copy:sigplot_doc']);
   
    // Publish is kinda tricky, you need to first setup your SSH
    // so you can login to ec2_user@demo.axiosengineering.com without using
    // a password.
    //
    // The next thing to be aware of, it expects that you have ../sigplot
    // available and that this checkout coorespondes to the version that
    // you want to document with jsdoc.  This may change in the future if 
    // we do one of the following:
    //  - package that docs as part of bower
    //  - have publish checkout a fresh version of the sigplot repository
    //    and use the latest release version for documentation 
    //  - we publish the sigplot-debug.js with *all* comments as opposed
    //    to the currently slightly-minimized version
    grunt.registerTask('publish', ['clean', 'build', 'doc']);

    // Default task.
    grunt.registerTask('default', 'build');

};
