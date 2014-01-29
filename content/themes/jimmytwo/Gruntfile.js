/*global module:false*/
module.exports = function (grunt) {
    'use strict';

    var pkgConfig = {
        stylesheets: 'assets/stylesheets',
        scripts: 'assets/scripts',
        fonts: 'assets/fonts',
        eggboxicons: 'assets/libs/eggbox',
        custom_eggboxicons: 'assets/custom-eggbox'
    };

    // configurable paths
    grunt.initConfig({
        pkg: pkgConfig,
        watch: {
            livereload: {
                files: [
                    '<%= pkg.templates %>/*',
                    '<%= pkg.stylesheets %>}/sass/{,*/}*.scss',
                    // '<%= pkg.scripts %>}/{,*/}*.js'
                ],
                tasks: ['livereload']
            }
        },
        regarde: {
            js: {
                files: ['<%= pkg.scripts %>/**/*.js', '!<%= pkg.scripts %>/**/*-min.js'],
                tasks: ['jshint'],
                spawn: true
            },
            css: {
                files: '<%= pkg.stylesheets %>/**/*.scss',
                tasks: ['compass:development', 'autoprefixer:development'],
                spawn: true
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= pkg.port %>'
            }
        },
        clean: [
            // '<%= pkg.scripts %>/*-min.js',
            '<%= pkg.stylesheets %>/*.css'
        ],
        jshint: {
            all: [
                'Gruntfile.js',
                '<%= pkg.app %>/scripts/{,*/}*.js',
                '!<%= pkg.app %>/scripts/lib/*'
            ]
        },
        compass: {
            development: {
                options: {
                    sassDir: '<%= pkg.stylesheets %>/sass',
                    cssDir: '<%= pkg.stylesheets %>',
                    specify: '<%= pkg.stylesheets %>/sass/styles.scss',
                    assetCacheBuster: true,
                    outputStyle: 'expanded',
                    debugInfo: true
                },
                files: {
                    '<%= pkg.stylesheets %>/styles.css': '<%= pkg.stylesheets %>/sass/styles.scss'
                }
            },
            production: {
                options: {
                    sassDir: '<%= pkg.stylesheets %>/sass',
                    cssDir: '<%= pkg.stylesheets %>',
                    specify: '<%= pkg.stylesheets %>/sass/styles.scss',
                    assetCacheBuster: true,
                    outputStyle: 'compressed',
                    debugInfo: false
                },
                files: {
                    '<%= pkg.stylesheets %>/styles.css': '<%= pkg.stylesheets %>/sass/styles.scss'
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 3 versions', '> 1%', 'ie 8', 'ie 7']
            },
            development: {
                files: {
                    '<%= pkg.stylesheets %>/styles.css': '<%= pkg.stylesheets %>/styles.css'
                }
            },
            production: {
                files: {
                    '<%= pkg.stylesheets %>/styles.css': '<%= pkg.stylesheets %>/styles.css'
                }
            }
        },
        cmq: {
            combine: {
                options: {
                    log: false
                },
                files: {
                    '<%= pkg.stylesheets %>/styles.css': '<%= pkg.stylesheets %>/styles.css'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    '<%= pkg.stylesheets %>/styles.css': '<%= pkg.stylesheets %>/styles.css'
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-combine-media-queries');

    // Simply watch script which does a build on entry
    grunt.registerTask('watch', [
        'default',
        'regarde'
    ]);

    // Build for development purposes with linting
    grunt.registerTask('default', [
        'clean',
        'compass:development',
        'autoprefixer:development'
        // 'cmq:combine'
    ]);

    // Server build
    grunt.registerTask('server', [
        'clean',
        'compass:development',
        'autoprefixer:development',
        'cmq:combine',
        'jshint'
    ]);

};
