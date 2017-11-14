/*
 * Aconite Animation Clock
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global ArrayMath*/

(function () {
    "use strict";

    fluid.defaults("aconite.animationClock", {
        gradeNames: "berg.clock.raf",

        listeners: {
            // Note: We start the clock and let it run continuously
            // because Bergson will record the current time
            // upon initialization, and then time will leap forward
            // when it starts ticking.
            //
            // In between, there is a risk that a scheduler may
            // start scheduling events before the clock has started,
            // causing these events to apparently occur immediately
            // upon the clock starting.
            // https://github.com/colinbdclark/bergson/issues/15
            "onCreate.start": "{that}.start()"
        }
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
