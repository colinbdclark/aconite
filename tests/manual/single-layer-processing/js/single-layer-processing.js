/*global fluid*/

(function () {
    "use strict";

    fluid.defaults("aconite.test.singleLayerProcessor", {
        gradeNames: ["aconite.animator"],

        invokers: {
            // TODO: You see how crazy this is on so many levels, right?
            render: "{layer}.refresh()"
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
            onAllReady: {
                events: {
                    onVideoReady: "{that}.layer.source.events.onReady",
                    onAnimatorReady: "{that}.events.onReady"
                }
            }
        },

        listeners: {
            onAllReady: [
                "{that}.play()",
                "{layer}.play()"
            ]
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.videoPlayer", {
        gradeNames: "aconite.videoPlayer.nativeElement",

        model: {
            loop: true
        }
    });

    fluid.defaults("aconite.test.singleLayerProcessor.videoLayer", {
        gradeNames: ["aconite.compositableVideo.layer", "fluid.viewComponent"],

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
            fragment: "shaders/greyscale.frag",
            vertex: "../../../src/shaders/stageVertexShader.vert"
        },

        uniforms: {
            // Colour transform matrix goes here.
        }
    });

}());
