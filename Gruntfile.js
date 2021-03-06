/* eslint-env node */

"use strict";

module.exports = function (grunt) {

    var files = {
        jQuery: [
            "node_modules/infusion/src/lib/jquery/core/js/jquery.js"
        ],

        infusion: [
            "node_modules/infusion/src/framework/core/js/Fluid.js",
            "node_modules/infusion/src/framework/core/js/FluidDebugging.js",
            "node_modules/infusion/src/framework/core/js/FluidIoC.js",
            "node_modules/infusion/src/framework/core/js/DataBinding.js",
            "node_modules/infusion/src/framework/core/js/FluidDOM.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformation.js",
            "node_modules/infusion/src/framework/core/js/ModelTransformationTransforms.js",
            "node_modules/infusion/src/framework/core/js/FluidDocument.js",
            "node_modules/infusion/src/framework/core/js/FluidDOMUtilities.js",
            "node_modules/infusion/src/framework/core/js/FluidView.js",
            "node_modules/infusion/src/framework/enhancement/js/ContextAwareness.js"
        ],

        bergson: [
            "node_modules/bergson/src/js/clock.js",
            "node_modules/bergson/src/js/clock-logger.js",
            "node_modules/bergson/src/js/raf-clock.js",
            "node_modules/bergson/src/js/priority-queue.js",
            "node_modules/bergson/src/js/scheduler.js"
        ],

        flocking: [
            "node_modules/flocking/dist/flocking-base.js",
            "node_modules/flocking/src/ugens/oscillators.js",
            "node_modules/flocking/src/ugens/envelopes.js"
        ],

        aconite: [
            "src/core.js",
            "src/readiness-notification.js",
            "src/timecode.js",
            "src/glComponent.js",
            "src/animation-clock.js",
            "src/animation.js",
            "src/compositor.js",
            "src/video.js",
            "src/video-timeline-notifier.js",
            "src/video-player.js",
            "src/video-performer.js",
            "src/compositables.js",
            "src/video-compositors.js",
            "src/clip-sequencers.js",
            "src/fcpxml-parser.js",
            "src/pip.js",
            "src/ui/js/playButton.js"
        ]
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        eslint: {
            all: ["src/**/*.js", "tests/**/*.js"],
        },

        concat: {
            options: {
                separator: ";",
                banner: "<%= aconite.banners.short %>"
            },

            all: {
                src: [].concat(
                    files.jQuery,
                    files.infusion,
                    files.bergson,
                    files.flocking,
                    files.aconite
                ),
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
    grunt.loadNpmTasks("fluid-grunt-eslint");

    grunt.registerTask("default", ["clean", "eslint", "concat", "uglify"]);
};
