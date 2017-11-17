/*
 * Aconite Pip Component
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global flock*/

(function () {
    "use strict";

    fluid.defaults("aconite.pip", {
        gradeNames: "fluid.modelComponent",

        pipOnFrame: 120,

        flashColor: {
            r: 1,
            g: 1,
            b: 1,
            a: 1
        },

        model: {
            frames: 0
        },

        invokers: {
            countFrames: {
                funcName: "aconite.pip.countFrames",
                args: ["{that}.options.pipOnFrame", "{that}.model", "{that}.events"]
            }
        },

        components: {
            pipClock: {
                type: "aconite.animationClock"
            },

            pipSynth: {
                type: "aconite.pip.synth"
            }
        },

        events: {
            onTick: "{pipClock}.events.onTick",
            onPlay: "{videoCompositor}.events.onStart",
            onPip: null,
            afterPip: null
        },

        listeners: {
            onCreate: [
                "aconite.pip.initFlocking()"
            ],

            onPlay: [
                "{pipSynth}.play()",
                "{pipClock}.start()"
            ],

            onTick: [
                "{that}.countFrames()"
            ],

            onPip: [
                "{pipSynth}.set(env.gate, 1.0)",
                "aconite.animator.setStageColor({glRenderer}.gl, {that}.options.flashColor)"
            ],

            afterPip: [
                "{pipSynth}.pause()",
                "aconite.animator.setStageColor({glRenderer}.gl, {animator}.options.stageBackgroundColor)",
                "{pipClock}.stop()"
            ],

            "{videoCompositor}.events.onPlay": [
                "{that}.destroy()"
            ]
        }
    });

    aconite.pip.initFlocking = function () {
        if (!window.flock) {
            console.log("Flocking has not been loaded, so aconite.pip will be silent.");
            return;
        }

        if (!flock.environment) {
            flock.init();
        }

        if (!flock.environment.model.isPlaying) {
            flock.environment.play();
        }
    };

    aconite.pip.countFrames = function (pipOnFrame, model, events) {
        model.frames++;
        if (model.frames === pipOnFrame) {
            events.onPip.fire();
        } else if (model.frames === pipOnFrame + 1) {
            events.afterPip.fire();
        }
    };

    fluid.defaults("aconite.pip.synth", {
        gradeNames: "flock.synth",

        synthDef: {
            ugen: "flock.ugen.sin",
            freq: 1000,
            mul: {
                id: "env",
                ugen: "flock.ugen.envGen",
                gate: 0.0,
                mul: 0.2,
                envelope: {
                    levels: [0, 1, 1, 0],
                    times: [0, 1 / 60, 0]
                }
            }
        }
    });

})();
