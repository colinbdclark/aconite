(function () {
    "use strict";

    fluid.defaults("aconite.test.multilayerTest", {
        gradeNames: [
            "aconite.videoSequenceCompositor"
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
                    freq: "{multilayerTest}.options.fps"
                }
            },

            glRenderer: {
                type: "colin.tofino.glRenderer"
            },

            // TODO: This suggests that we need
            // more fine-grained composition of the behaviours
            // in aconite.videoCompositor.
            playButton: {
                type: "fluid.emptySubcomponent"
            },

            top: {
                type: "colin.tofino.topSequencer"
            },

            bottom: {
                type: "colin.tofino.bottomSequencer"
            },

            blendModulator: {
                type: "colin.tofino.videoBlendModulator",
                options: {
                    components: {
                        enviro: "{multilayerTest}.enviro"
                    }
                }
            }
        },

        listeners: {
            // TODO: This should probably be factored out into
            // an Aconite "play when the videos are ready" grade.
            "onVideosReady.play": {
                func: "{that}.events.onPlay.fire"
            }
        }
    });

    fluid.registerNamespace("colin.tofino");

    colin.tofino.updateUniformModelValue = function (that, tofino, modelPath) {
        // This wasn't working as a relay! Why not?
        that.value();
        fluid.set(tofino.model, modelPath, that.model.value);
    };


    fluid.defaults("colin.tofino.glRenderer", {
        gradeNames: "aconite.videoCompositor.glRenderer",

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


    fluid.defaults("colin.tofino.sequencer", {
        gradeNames: "aconite.clipSequencer.static",

        loop: true,

        model: {
            clipSequence: [
                "{that}.options.clip"
            ]
        }
    });


    fluid.defaults("colin.tofino.topSequencer", {
        gradeNames: "colin.tofino.sequencer",

        clip: {
            url: "../../videos/lichen-01-720p.mp4"
        },

        components: {
            layer: {
                type: "aconite.videoCompositor.topLayer"
            }
        }
    });


    fluid.defaults("colin.tofino.bottomSequencer", {
        gradeNames: "colin.tofino.sequencer",

        clip: {
            url: "../../videos/lichen-03-720p.mp4"
        },

        components: {
            layer: {
                type: "aconite.videoCompositor.bottomLayer"
            }
        }
    });


    fluid.defaults("colin.tofino.videoBlendModulator", {
        gradeNames: ["flock.synth.frameRate"],

        fps: "{multilayerTest}.options.fps",

        model: {
            value: 0.5
        },

        synthDef: {
            id: "osc",
            ugen: "flock.ugen.triOsc",
            inputs: {
                freq: 1/15,
                mul: 0.2,
                add: 0.5,
                phase: -1
            }
        },

        listeners: {
            "{clock}.events.onTick": [
                "colin.tofino.updateUniformModelValue({that}, {multilayerTest}, layerBlend)"
            ]
        }
    });
}());
