/*
 * Aconite Animation Clock
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite, DSP*/

(function () {
    "use strict";

    fluid.defaults("aconite.animationClock", {
        gradeNames: "berg.clock.raf"
    });


    fluid.defaults("aconite.animationClock.frameCounter", {
        gradeNames: "berg.clock.logger",

        invokers: {
            maxDuration: {
                funcName: "aconite.animationClock.frameCounter.maxDuration",
                args: ["{that}.intervalLog"]
            },

            avgDuration: {
                funcName: "aconite.animationClock.frameCounter.avgDuration",
                args: ["{that}.model.frameCount", "{that}.intervalLog"]
            }
        }
    });

    aconite.animationClock.frameCounter.maxDuration = function (intervalLog) {
        return DSP.max(intervalLog);
    };

    aconite.animationClock.frameCounter.avgDuration = function (frameCount, intervalLog) {
        var sum = 0;
        for (var i = 0; i < frameCount; i++) {
            sum += intervalLog[i];
        }

        return sum / frameCount;
    };
}());
