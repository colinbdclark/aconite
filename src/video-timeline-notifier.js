/*
 * Aconite Video Timeline Notifier
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2018, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.videoTimelineNotifier", {
        gradeNames: "fluid.component",

        components: {
            clock: {
                type: "berg.clock.raf"
            },

            video: {
                type: "aconite.video"
            }
        },

        invokers: {
            start: {
                func: "{clock}.start"
            },

            stop: {
                func: "{clock}.stop"
            },

            checkCurrentTime: {
                funcName: "aconite.videoTimelineNotifier.checkCurrentTime",
                args: ["{that}"]
            }
        },

        events: {
            onClipIn: null,
            onTick: "{clock}.events.onTick",
            onClipOut: null,
        },

        listeners: {
            "onTick.checkCurrentTime": {
                func: "{that}.checkCurrentTime"
            }
        }
    });

    aconite.videoTimelineNotifier.checkCurrentTime = function (that) {
        // TODO: Indications are that video.currentTime isn't
        // updated with frame-level accuracy.
        // https://youtu.be/GsvAdTyXN8o?t=748
        // Instead, do we need to refer to a Bergson clock's timing,
        // which has been synched to the actual play start time
        // of the video?
        var videoTime = that.video.element.currentTime,
            m = that.video.model;

        // TODO: This algorithm will fail in cases where
        // outTime hasn't been set. We need to be able to
        // take the video's duration into account as well.
        // TODO: We may want to test whether we're within
        // the range of in/out time by less than a tick's duration.
        if (videoTime <= m.inTime) {
            that.events.onClipIn.fire(videoTime);
        } else if (videoTime >= m.outTime) {
            that.events.onClipOut.fire(videoTime);
        }
    };
})();
