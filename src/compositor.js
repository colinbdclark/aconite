/*
 * Aconite Compositor
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2017, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.compositor", {
        gradeNames: [
            "aconite.readinessResponder",
            "aconite.animator"
        ],

        readinessEventName: "onLayersReady",

        drawableChildOptions: {
            gradeNames: "aconite.readinessNotifier",

            listeners: {
                "{compositor}.events.onDraw": "{that}.draw()"
            }
        },

        playableChildOptions: {
            listeners: {
                "{compositor}.events.onPlay": "{that}.play()"
            }
        },

        distributeOptions: [
            {
                source: "{that}.options.drawableChildOptions",
                target: "{that > aconite.drawable}.options"
            },
            {
                source: "{that}.options.playableChildOptions",
                target: "{that > aconite.playable}.options"
            }
        ],

        components: {
            glRenderer: {
                type: "fluid.mustBeOverridden"
            }
        },

        events: {
            onStart: null,
            onLayersReady: null
        }
    });


    fluid.defaults("aconite.compositor.autoPlay", {
        gradeNames: "aconite.compositor",

        listeners: {
            "onLayersReady.play": {
                func: "{that}.events.onPlay.fire"
            }
        }
    });


    fluid.defaults("aconite.compositor.withPlayButton", {
        gradeNames: "aconite.compositor",

        components: {
            playButton: {
                createOnEvent: "onLayersReady",
                type: "aconite.ui.playButtonOverlay",
                container: "{withPlayButton}.dom.playButton",
                options: {
                    events: {
                        onActivated: "{withPlayButton}.events.onStart",
                        onPlay: "{withPlayButton}.events.onPlay"
                    },

                    selectors: {
                        fullScreen: "{withPlayButton}.options.selectors.stage"
                    }
                }
            }
        },

        selectors: {
            playButton: ".aconite-animator-play"
        }
    });
})();
