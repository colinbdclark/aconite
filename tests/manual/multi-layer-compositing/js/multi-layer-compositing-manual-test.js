/*global fluid*/

(function () {
    "use strict";

    fluid.defaults("aconite.test.multilayerCompositor", {
        gradeNames: [
            "aconite.videoCompositor.autoPlay",
            "aconite.dualLayerVideoCompositor"
        ],

        fps: 30,

        model: {
            layerBlend: 0
        },

        uniformModelMap: {
            layerBlend: "layerBlend"
        },

        components: {
            enviro: {
                type: "flock.enviro"
            },

            clock: {
                options: {
                    freq: "{multilayerCompositor}.options.fps"
                }
            },

            glRenderer: {
                type: "aconite.test.multilayerCompositor.glRenderer"
            },

            top: {
                type: "aconite.test.multilayerCompositor.top"
            },

            bottom: {
                type: "aconite.test.multilayerCompositor.bottom"
            },

            blendModulator: {
                type: "aconite.test.multilayerCompositor.videoBlendModulator",
                options: {
                    components: {
                        enviro: "{multilayerCompositor}.enviro"
                    }
                }
            }
        }
    });


    aconite.test.multilayerCompositor.updateUniformModelValue = function (that, tofino, modelPath) {
        // TODO: This wasn't working as a relay! Why not?
        that.value();
        fluid.set(tofino.model, modelPath, that.model.value);
    };


    fluid.defaults("aconite.test.multilayerCompositor.glRenderer", {
        gradeNames: "aconite.dualLayerVideoCompositor.glRenderer",

        shaders: {
            fragment: "shaders/simplified-tofino-shader.frag",
            vertex: "../../../src/shaders/stageVertexShader.vert"
        },

        uniforms: {
            layerBlend: {
                type: "1f",
                values: 0.0
            }
        }
    });


    fluid.defaults("aconite.test.multilayerCompositor.layer", {
        gradeNames: "aconite.compositableVideo.layer",

        // TODO: This material should be moved to top-level options in
        // aconite.compositableVideo or a similar grade.
        components: {
            source: {
                options: {
                    url: "{layer}.options.url"
                }
            },

            sourcePlayer: {
                options: {
                    model: {
                        loop: true
                    }
                }
            }
        }
    });


    fluid.defaults("aconite.test.multilayerCompositor.top", {
        gradeNames: [
            "aconite.test.multilayerCompositor.layer",
            "aconite.dualLayerVideoCompositor.topLayer"
        ],
        url: "../../videos/lichen-01-720p.mp4"
    });


    fluid.defaults("aconite.test.multilayerCompositor.bottom", {
        gradeNames: [
            "aconite.test.multilayerCompositor.layer",
            "aconite.dualLayerVideoCompositor.bottomLayer"
        ],
        url: "../../videos/lichen-03-720p.mp4"
    });


    fluid.defaults("aconite.test.multilayerCompositor.videoBlendModulator", {
        gradeNames: ["flock.synth.frameRate"],

        fps: "{multilayerCompositor}.options.fps",

        model: {
            value: 0.5
        },

        synthDef: {
            id: "osc",
            ugen: "flock.ugen.triOsc",
            inputs: {
                freq: 1 / 15,
                mul: 0.2,
                add: 0.5,
                phase: -1
            }
        },

        listeners: {
            "{clock}.events.onTick": [
                "aconite.test.multilayerCompositor.updateUniformModelValue({that}, {multilayerCompositor}, layerBlend)"
            ]
        }
    });
})();
