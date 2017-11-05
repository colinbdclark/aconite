(function () {
    "use strict";

    fluid.defaults("aconite.test.singleLayerProcessor", {
        gradeNames: ["aconite.videoCompositor.autoPlay"],

        model: {
            colourMatrix:  [
                // Greyscale luma.
                [
                    0.2126, 0.7152, 0.0722, 0, 0,
                    0.2126, 0.7152, 0.0722, 0, 0,
                    0.2126, 0.7152, 0.0722, 0, 0,
                    0, 0, 0, 1, 0
                ]
            ]
        },

        uniformModelMap: {
            // TODO: Remove the need to define a uniform model map
            // in cases where it's an "identity mapping".
            colourMatrix: "colourMatrix"
        },

        components: {
            layer: {
                type: "aconite.test.singleLayerProcessor.videoLayer",
                container: "{singleLayerProcessor}.container"
            },

            glRenderer: {
                type: "aconite.test.singleLayerProcessor.glRenderer"
            }
        },

        events: {
            onVideosReady: "{that}.layer.source.events.onReady"
        },

        listeners: {
            "onPlay.playLayer": {
                after: "startClock",
                func: "{layer}.play"
            }
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.videoPlayer", {
        gradeNames: "aconite.videoPlayer.nativeElement",

        model: {
            loop: true
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.videoLayer", {
        gradeNames: [
            "aconite.compositableVideo.layer", "fluid.viewComponent"
        ],

        components: {
            source: {
                type: "aconite.video",
                options: {
                    members: {
                        element: "{videoLayer}.dom.video.0"
                    }
                }
            },

            sourcePlayer: {
                type: "aconite.test.singleLayerProcessor.videoPlayer",
                container: "{videoLayer}.dom.video"
            }
        },

        selectors: {
            video: "video"
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.glRenderer", {
        gradeNames: "aconite.glRenderer.singleLayer",

        shaders: {
            fragment: "shaders/colour-matrix.frag",
            vertex: "../../../src/shaders/stageVertexShader.vert"
        },

        uniforms: {
            colourMatrix: {
                type: "1fv",
                // TODO: Currently Aconite requires all array-typed uniforms
                // (i.e. xfv uniforms) to explicitly declare their dimensions,
                // hence the need to wrap the colour matrix in an container array.
                values: [
                    // Identity.
                    [
                        1, 0, 0, 0, 0,
                        0, 1, 0, 0, 0,
                        0, 0, 1, 0, 0,
                        0, 0, 0, 1, 0
                    ]
                ]
            }
        }
    });

})();
