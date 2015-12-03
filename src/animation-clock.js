/*
 * Aconite Animation Clock
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite, performance, DSP*/

(function () {
    "use strict";

    fluid.defaults("aconite.animationClock", {
        gradeNames: "berg.clock.raf"
    });


    fluid.defaults("aconite.animationClock.frameCounter", {
        gradeNames: "fluid.modelComponent",

        numFrames: 72000, // 20 minutes at 60 fps

        members: {
            frameDurations: {
                expander: {
                    funcName: "aconite.animationClock.frameCounter.initFrameDurations",
                    args: ["{that}.options.numFrames"]
                }
            }
        },

        model: {
            lastTime: null,
            frameCount: 0
        },

        invokers: {
            recordTime: {
                funcName: "aconite.animationClock.frameCounter.recordTime",
                args: [ "{that}.frameDurations", "{that}.model"]
            },

            maxDuration: {
                funcName: "aconite.animationClock.frameCounter.maxDuration",
                args: ["{that}.frameDurations"]
            },

            avgDuration: {
                funcName: "aconite.animationClock.frameCounter.avgDuration",
                args: ["{that}.model.frameCount", "{that}.frameDurations"]
            }
        },

        listeners: {
            "{animationClock}.events.onTick": "{that}.recordTime()"
        }
    });

    aconite.animationClock.frameCounter.initFrameDurations = function (numFrames) {
        return new Float32Array(numFrames);
    };

    aconite.animationClock.frameCounter.maxDuration = function (frameDurations) {
        return DSP.max(frameDurations);
    };

    aconite.animationClock.frameCounter.avgDuration = function (frameCount, frameDurations) {
        var sum = 0;
        for (var i = 0; i < frameCount; i++) {
            sum += frameDurations[i];
        }

        return sum / frameCount;
    };

    aconite.animationClock.frameCounter.recordTime = function (frameDurations, m) {
        if (m.lastTime === null) {
            m.lastTime = performance.now();
            return;
        }

        var now = performance.now(),
            dur = now - m.lastTime;

        frameDurations[m.frameCount] = dur;

        m.lastTime = now;
        m.frameCount++;
    };
}());
