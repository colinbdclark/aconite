/*
 * Aconite Animation Clock
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite, ArrayMath*/

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
                args: ["{that}.tickCounter", "{that}.intervalLog"]
            }
        }
    });

    aconite.animationClock.frameCounter.maxDuration = function (intervalLog) {
        return ArrayMath.max(intervalLog);
    };

    aconite.animationClock.frameCounter.avgDuration = function (tickCounter, intervalLog) {
        var sum = 0;
        for (var i = 0; i < tickCounter; i++) {
            sum += intervalLog[i];
        }

        return sum / (tickCounter + 1);
    };

})();
