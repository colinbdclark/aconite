/*global fluid*/

(function () {
    "use strict";

    fluid.defaults("aconite.test.singleLayerProcessor", {
        gradeNames: ["aconite.test.videoPlayerTest", "aconite.animator"],

        invokers: {
            // TODO: You see how crazy this is on so many levels, right?
            render: "{layer}.refresh()"
        },

        components: {
            player: {
                type: "aconite.test.singleLayerProcessor.videoPlayer",
                container: "{singleLayerProcessor}.dom.video"
            },

            layer: {
                type: "aconite.test.singleLayerProcessor.videoLayer"
            },

            glRenderer: {
                type: "aconite.test.singleLayerProcessor.glRenderer"
            }
        },

        listeners: {
            "{that}.layer.source.events.onReady": [
                "{that}.play()"
            ]
        },

        selectors: {
            video: "video"
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.videoPlayer", {
        gradeNames: "aconite.videoPlayer.nativeElement",

        model: {
            loop: true
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.videoLayer", {
        gradeNames: "aconite.compositableVideo.layer",

        components: {
            source: "{singleLayerProcessor}.video"
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.glRenderer", {
        gradeNames: "aconite.glRenderer.singleLayer",

        shaders: {
            fragment: "shaders/greyscale.frag",
            vertex: "../../../src/shaders/stageVertexShader.vert"
        },

        uniforms: {
            // Colour transform matrix goes here.
        }
    });

}());
