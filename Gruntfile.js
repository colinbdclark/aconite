/*global module*/

module.exports = function(grunt) {
    "use strict";

    var files = {
        jQuery: [
            "third-party/jquery/js/jquery.js"
        ],

        infusion: [
            "third-party/infusion/js/Fluid.js",
            "third-party/infusion/js/FluidDebugging.js",
            "third-party/infusion/js/FluidIoC.js",
            "third-party/infusion/js/DataBinding.js",
            "third-party/infusion/js/FluidDOM.js",
            "third-party/infusion/js/ModelTransformation.js",
            "third-party/infusion/js/ModelTransformationTransforms.js",
            "third-party/infusion/js/FluidDocument.js",
            "third-party/infusion/js/FluidDOMUtilities.js",
            "third-party/infusion/js/FluidView.js"
        ],

        aconite: [
            "src/core.js",
            "src/glComponent.js",
            "src/animation.js",
            "src/video.js",
            "src/video-player.js",
            "src/compositables.js",
            "src/clip-sequencers.js",
            "src/fcpxml-parser.js",
            "src/pip.js",
            "src/ui/playButton.js"
        ]
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        jshint: {
            all: [
                "src/**/*.js",
                "tests/**/*js",
                "!**/third-party/**"
            ],
            options: {
                jshintrc: true
            }
        },

        concat: {
            options: {
                separator: ";",
                banner: "<%= aconite.banners.short %>"
            },

            all: {
                src: [].concat(files.jQuery, files.infusion, files.aconite),
                dest: "dist/<%= pkg.name %>-all.js"
            },

            only: {
                src: [].concat(files.aconite),
                dest: "dist/<%= pkg.name %>-only.js"
            }
        },

        uglify: {
            options: {
                banner: "<%= aconite.banners.short %>",
                beautify: {
                    ascii_only: true
                }
            },
            all: {
                files: [
                    {
                        expand: true,
                        cwd: "dist/",
                        src: ["*.js"],
                        dest: "dist/",
                        ext: ".min.js",
                    }
                ]
            }
        },

        clean: {
            all: {
                src: ["dist/"]
            }
        },

        watch: {
            scripts: {
                files: ["src/**/*.js", "third-party/**/*.js", "Gruntfile.js"],
                tasks: ["default"],
                options: {
                    spawn: false
                }
            }
        },

        aconite: {
            banners: {
                short: "/*! Aconite <%= pkg.version %>, Copyright <%= grunt.template.today('yyyy') %> Colin Clark | github.com/colinbdclark/aconite */\n\n"
            }
        }
    });

    // Load relevant Grunt plugins.
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["clean", "jshint", "concat", "uglify"]);
};
