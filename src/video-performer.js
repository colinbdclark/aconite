/*
 * Aconite Video Performer
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2017, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    /**
     * A Video Performer is a component that combines a
     * video source with a video player.
     */
    fluid.defaults("aconite.videoPerformer", {
        gradeNames: [
            "fluid.modelComponent",
            "aconite.playable"
        ],

        model: {},

        invokers: {
            // TODO: These invokers can be replaced with:
            //
            // play: "{that}.player.play()",
            // pause: "{that}.player.pause()"
            //
            // when an Infusion bug is fixed. In the meantime,
            // this indirection is required to avoid model relaying issues
            // between this component and its children by ensuring that the
            // player doesn't get created too soon—and thus the parent's model
            // values are correctly pushed to the children.
            play: "{that}.events.onPlay.fire()",
            pause: "{that}.events.onPause.fire()"
        },

        components: {
            source: {
                type: "aconite.video",
                options: {
                    gradeNames: ["aconite.videoPerformer.relayingChild"],
                    events: {
                        onReady: "{videoPerformer}.events.onReady"
                    }
                }
            },

            player: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    gradeNames: ["aconite.videoPerformer.relayingChild"],
                    components: {
                        video: "{videoPerformer}.source"
                    },
                    listeners: {
                        "{videoPerformer}.events.onPlay": "{that}.play()",
                        "{videoPerformer}.events.onPause": "{that}.pause()"
                    }
                }
            }
        },

        events: {
            onReady: null,
            onPlay: null,
            onPause: null
        }
    });

    fluid.defaults("aconite.videoPerformer.relayingChild", {
        gradeNames: "fluid.modelComponent",

        model: {},

        // Note: this relay is required to prevent
        // initial model values from propagating back
        // from this component up to the parent,
        // overriding the user's desired value.
        modelRelay: {
            source: "{videoPerformer}.model",
            target: "{that}.model",
            backward: {
                excludeSource: "init"
            },
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }
    });
})();
