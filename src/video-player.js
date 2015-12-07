/*
 * Aconite Video Player
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite, berg*/

(function () {
    "use strict";

    fluid.defaults("aconite.videoPlayer", {
        gradeNames: "fluid.modelComponent",

        model: {
            rate: 1.0,
            loop: false,
            isPlaying: false,
            inTime: 0,
            outTime: Infinity
        },

        invokers: {
            play: "{that}.events.onPlay.fire()",
            pause: "{that}.events.onPause.fire()"
        },

        components: {
            video: {
                type: "aconite.video"
            }
        },

        events: {
            onVideoLoaded: "{video}.events.onVideoLoaded",
            onReady: "{video}.events.onReady",
            onPlay: null,
            onPause: null,
            onVideoEnded: "{video}.events.onVideoEnded"
        },

        listeners: {
            onPlay: [
                {
                    changePath: "isPlaying",
                    value: true
                }
            ],

            onPause: [
                {
                    changePath: "isPlaying",
                    value: false
                }
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

    aconite.videoPlayer.seekToInTime = function (inTime, that) {
        if (that.model.seekImmediately) {
            that.video.element.currentTime = inTime;
        }
    };

    aconite.videoPlayer.checkEndTime = function (that) {
        if (that.model.endTime <= that.video.element.currentTime) {
            that.events.onVideoEnded.fire();
        }
    };


    /**
     * A Video Player that uses the underlying HTML video element's
     * own playback functionality directly.
     */
    fluid.defaults("aconite.videoPlayer.nativeElement", {
        gradeNames: "aconite.videoPlayer",

        listeners: {
            onPlay: [
                {
                    this: "{that}.video.element",
                    method: "play"
                }
            ],
            onPause: [
                {
                    this: "{that}.video.element",
                    method: "pause"
                }
            ]
        },

        modelListeners: {
            loop: {
                funcName: "aconite.videoPlayer.nativeElement.setVideoProperty",
                args: ["{that}.video", "loop", "{change}.value"]
            },

            rate: {
                funcName: "aconite.videoPlayer.nativeElement.setVideoProperty",
                args: ["{that}.video", "playbackRate", "{change}.value"]
            }
        }
    });

    aconite.videoPlayer.nativeElement.setVideoProperty = function (video, propName, value) {
        video.element[propName] = value;
    };


    /**
     * An online VideoPlayer driven by an external clock.
     *
     * This implementation will drop frames as necessary to keep up
     * with real time.
     */
    fluid.defaults("aconite.videoPlayer.manual", {
        gradeNames: "aconite.videoPlayer",

        members: {
            previousTime: "{clock}.time"
        },

        components: {
            clock: {
                type: "fluid.emptySubcomponent"
            }
        },

        events: {
            onTick: "{that}.clock.events.onTick"
        },

        listeners: {
            "onPlay.startClock": [
                "{that}.clock.start()"
            ],

            "onPause.stopClock": [
                "{that}.clock.stop()"
            ],

            "onTick.advanceVideo": [
                "aconite.videoPlayer.manual.advanceVideo({arguments}.0, {that})"
            ],

            onVideoEnded: [
                "aconite.videoPlayer.manual.end({that})"
            ]
        }
    });

    aconite.videoPlayer.manual.advanceVideo = function (time, that) {
        if (!that.model.isPlaying) {
            return;
        }

        // TODO: This will cause problems when pausing and restarting playback,
        // since that.previousTime may be a very long ago.
        // We should probably reset that.previousTime when playing the video
        // (risking a one frame duration lag when playing).
        var tickDuration = time - that.previousTime;
        that.video.element.currentTime += tickDuration * that.model.rate;
        that.previousTime = time;

        aconite.videoPlayer.checkEndTime(that);
    };

    aconite.videoPlayer.manual.end = function (that) {
        if (that.model.loop) {
            that.video.element.currentTime = that.model.inTime;
        } else {
            that.pause();
        }
    };


    fluid.defaults("aconite.videoPlayer.manualOnline", {
        gradeNames: "aconite.videoPlayer.manual",

        components: {
            clock: {
                type: "berg.clock.raf"
            }
        },

        listeners: {
            onPlay: [
                {
                    priority: "before:startClock",
                    funcName: "aconite.videoPlayer.manualOnline.resetPreviousTime",
                    args: ["{that}"]
                }
            ]
        }
    });

    aconite.videoPlayer.manualOnline.resetPreviousTime = function (that) {
        that.previousTime = berg.clock.realtime.now();
    };

    /**
     * An offline VideoPlayer driven by an external clock.
     */
    fluid.defaults("aconite.videoPlayer.manualOffline", {
        gradeNames: "aconite.videoPlayer.manual",

        invokers: {
            tick: {
                funcName: "aconite.videoPlayer.manualOffline.advanceVideo",
                args: ["{arguments}.0", "{clock}.tickDuration", "{that}"]
            }
        }
    });

    aconite.videoPlayer.manualOffline.advanceVideo = function (time, tickDuration, that) {
        if (!that.model.isPlaying) {
            return;
        }
        that.video.element.currentTime += tickDuration;
        aconite.videoPlayer.checkEndTime(time, that);
    };
}());
