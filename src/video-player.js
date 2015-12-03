/*
 * Aconite Video Player
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite*/

(function () {
    "use strict";

    /**
     * An online VideoPlayer driven by an external clock.
     *
     * This implementation will drop frames as necessary to keep up
     * with real time.
     */
    fluid.defaults("aconite.videoPlayer", {
        gradeNames: "fluid.modelComponent",

        members: {
            previousTime: "{clock}.time",
            currentTime: 0
        },

        model: {
            rate: 1.0,
            loop: false,
            seekImmediately: true,
            isPlaying: false,
            inTime: 0,
            outTime: Infinity
        },

        components: {
            clock: {
                type: "berg.clock.raf"
            },

            video: {
                type: "aconite.video"
            }
        },

        invokers: {
            play: {
                changePath: "isPlaying",
                value: true
            },

            pause: {
                changePath: "isPlaying",
                value: false
            },

            tick: {
                funcName: "aconite.videoPlayer.tick",
                args: ["{arguments}.0", "{that}"]
            }
        },

        events: {
            onVideoLoaded: "{video}.events.onVideoLoaded",
            onReady: "{video}.events.onReady",
            onVideoEnded: "{video}.events.onVideoEnded"
        },

        listeners: {
            "{clock}.events.onTick": [
                "{that}.tick({arguments}.0)"
            ],
            onVideoEnded: [
                "aconite.videoPlayer.end({that})"
            ]
        },

        modelListeners: {
            inTime: [
                "aconite.videoPlayer.seekToInTime({change}.value, {that})"
            ],

            outTime: [
                "aconite.videoPlayer.checkEndTime({that})"
            ]
        }
    });

    aconite.videoPlayer.checkEndTime = function (that) {
        if (that.model.endTime <= that.video.currentTime) {
            that.events.onVideoEnded.fire();
        }
    };

    aconite.videoPlayer.tick = function (time, that) {
        if (!that.model.isPlaying) {
            return;
        }

        var tickDuration = time - that.previousTime;
        that.video.currentTime += tickDuration * that.model.rate;
        that.previousTime = time;

        aconite.videoPlayer.checkEndTime(that);
    };

    aconite.videoPlayer.end = function (that) {
        if (that.model.loop) {
            that.video.currentTime = that.model.inTime;
        } else {
            that.pause();
        }
    };

    aconite.videoPlayer.seekToInTime = function (inTime, that) {
        if (that.model.seekImmediately) {
            that.video.currentTime = inTime;
        }
    };


    /**
     * An offline VideoPlayer driven by an external clock.
     */
    fluid.defaults("aconite.offlineVideoPlayer", {
        gradeNames: "aconite.videoPlayer",

        invokers: {
            tick: {
                funcName: "aconite.offlineVideoPlayer.tick",
                args: ["{arguments}.0", "{clock}.tickDuration", "{that}"]
            }
        }
    });

    aconite.offlineVideoPlayer.tick = function (time, tickDuration, that) {
        if (!that.model.isPlaying) {
            return;
        }
        that.video.currentTime += tickDuration;
        aconite.videoPlayer.checkEndTime(time, that);
    };

}());
