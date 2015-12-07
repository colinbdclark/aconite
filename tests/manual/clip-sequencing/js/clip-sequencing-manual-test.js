/*global fluid*/

(function () {
    "use strict";

    fluid.defaults("aconite.test.clipSequencingTest", {
        gradeNames: [
            "aconite.animator.playable",
            "aconite.animator.debugging",
            "aconite.videoSequenceCompositor"
        ],

        uniformModelMap: {},

        components: {
            glRenderer: {
                type: "aconite.test.clipSequencingTest.glRenderer"
            },

            playButton: {
                options: {
                    playDelay: 2
                }
            },

            top: {
                type: "aconite.test.clipSequencingTest.topSequencer"
            },

            bottom: {
                type: "aconite.test.clipSequencingTest.bottomSequencer"
            }
        },

        selectors: {
            fpsCounter: ".aconite-fps-display"
        }
    });

    fluid.defaults("aconite.test.clipSequencingTest.topSequencer", {
        gradeNames: "aconite.clipSequencer.static",

        model: {
            clipSequence: [
                {
                    url: "../../videos/1.m4v",
                    duration: 10
                },
                {
                    url: "../../videos/2.m4v",
                    duration: 10
                },
                {
                    url: "../../videos/3.m4v",
                    duration: 10
                },
                {
                    url: "../../videos/5.m4v",
                    duration: 10
                },
                {
                    url: "../../videos/6.m4v",
                    duration: 10
                }
            ]
        },

        components: {
            layer: {
                type: "aconite.videoCompositor.topLayer"
            }
        }
    });

    fluid.defaults("aconite.test.clipSequencingTest.bottomSequencer", {
        gradeNames: "aconite.clipSequencer.static",

        model: {
            clipSequence: [
                {
                    url: "../../videos/all.m4v",
                    duration: 60
                }
            ]
        },

        components: {
            layer: {
                type: "aconite.videoCompositor.bottomLayer"
            }
        }
    });

    fluid.defaults("aconite.test.clipSequencingTest.glRenderer", {
        gradeNames: "aconite.videoCompositor.glRenderer",

        shaders: {
            fragment: "../../../src/shaders/readTopLayerFragmentShader.frag",
            vertex: "../../../src/shaders/stageVertexShader.vert"
        },

        uniforms: {}
    });

}());
