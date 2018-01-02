/*
 * Aconite Video Player
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2018, Colin Clark
 * Distributed under the MIT license.
 */

/*global berg*/

(function () {
    "use strict";

    fluid.defaults("aconite.videoPlayer", {
        gradeNames: "fluid.modelComponent",

        model: {
            rate: 1.0,
            loop: false,
            isPlaying: false
        },

        invokers: {
            play: "{that}.events.onPlay.fire()",

            pause: "{that}.events.onPause.fire()",

            handleOutPoint: {
                funcName: "aconite.videoPlayer.handleOutPoint",
                args: ["{that}"]
            }
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

        // TODO: Move this to a base grade that can be shared
        // with aconite.animator and perhaps other drawables.
        listeners: {
            "onPlay.updateModel": {
                changePath: "isPlaying",
                value: true
            },

            "onPause.updateModel": {
                changePath: "isPlaying",
                value: false
            }
        },

        modelListeners: {
            inTime: [
                "aconite.videoPlayer.seekToTime({change}.value, {that})"
            ],

            outTime: [
                "aconite.videoPlayer.checkEndTime({that})"
            ]
        }
    });

    aconite.videoPlayer.seekToTime = function (time, that) {
        that.video.element.currentTime = time;
    };

    aconite.videoPlayer.checkEndTime = function (that) {
        if (that.model.endTime <= that.video.element.currentTime) {
            that.events.onVideoEnded.fire();
        }
    };

    aconite.videoPlayer.handleOutPoint = function (that) {
        if (that.model.loop) {
            aconite.videoPlayer.seekToTime(that.model.inTime, that);
        } else {
            that.pause();
        }
    };

    /**
     * A Video Player that uses the underlying HTML video element's
     * own playback functionality directly.
     */
    fluid.defaults("aconite.videoPlayer.nativeElement", {
        gradeNames: "aconite.videoPlayer",

        // TODO: We should consolidate these components
        // somewhere where they can be shared across all
        // actors in an animation.
        components: {
            scheduler: {
                type: "berg.scheduler",
                options: {
                    components: {
                        clock: {
                            type: "berg.clock.raf"
                        }
                    }
                }
            }
        },

        members: {
            scheduledOutPointAction: {
                type: "repeat",
                time: 0,
                freq: 0,
                callback: "{that}.handleOutPoint"
            }
        },

        listeners: {
            "onPlay.startClock": {
                func: "{scheduler}.clock.start"
            },

            // TODO: This should be bound to the promise resolution
            // caused by videoElement.play() actually starting playing;
            // hence an "afterPlay" event is likely required.
            "onPlay.scheduleOutPointAction": {
                priority: "after:startClock",
                funcName: "aconite.videoPlayer.nativeElement.scheduleOutPointAction",
                args: ["{that}"]
            },

            "onPlay.playVideoElement": {
                priority: "after:scheduleOutPointAction",
                this: "{that}.video.element",
                method: "play"
            },

            "onPause.pauseVideoElement": {
                this: "{that}.video.element",
                method: "pause"
            },

            "onPause.cancelOutPointAction": {
                priority: "after:pauseVideoElement",
                funcName: "aconite.videoPlayer.nativeElement.cancelOutPointAction",
                args: ["{that}"]
            },

            "onPause.stopClock": {
                priority: "after:cancelLoop",
                func: "{scheduler}.clock.stop"
            }
        },

        modelListeners: {
            loop: {
                funcName: "aconite.video.setAttribute",
                args: ["{that}.video", "loop", "{change}.value"]
            },

            rate: {
                funcName: "aconite.video.setAttribute",
                args: ["{that}.video", "playbackRate", "{change}.value"]
            }
        }
    });

    aconite.videoPlayer.nativeElement.canLoopNatively = function (that) {
        var m = that.video.model,
            vidDur = that.video.element.duration;

        return (!m.inTime) &&
            (!m.outTime || m.outTime === vidDur) &&
            (!m.duration || m.duration === vidDur);
    };

    aconite.videoPlayer.nativeElement.scheduleOutPointAction = function (that) {
        // We don't need to manually schedule the out point event
        // if we:
        // 1. are not looping and
        // 2. don't have an early outTime or a late inTime
        if (!that.model.loop &&
            aconite.videoPlayer.nativeElement.canLoopNatively(that)) {
            return;
        }

        aconite.videoPlayer.nativeElement.cancelOutPointAction(that);

        // TODO: This should be implemented more efficiently,
        // using values that are parsed via a model relay.
        var endTime = aconite.time.timeUntilEnd(that.video.element.currentTime,
            that.model);
        var loopDuration = 1.0 / aconite.time.duration(that.model);
        that.scheduledOutPointAction.time = endTime;
        that.scheduledOutPointAction.freq = loopDuration;

        that.scheduler.schedule(that.scheduledOutPointAction);
    };

    aconite.videoPlayer.nativeElement.cancelOutPointAction = function (that) {
        that.scheduler.clear(that.scheduledOutPointAction);
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
            "onPlay.startClock": "{that}.clock.start()",

            "onPause.stopClock": "{that}.clock.stop()",

            "onTick.advanceVideo": {
                funcName: "aconite.videoPlayer.manual.advanceVideo",
                args: ["{arguments}.0", "{that}"]
            },

            "onVideoEnded.handleOut": "aconite.videoPlayer.handleOutPoint({that})"
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


    fluid.defaults("aconite.videoPlayer.manualOnline", {
        gradeNames: "aconite.videoPlayer.manual",

        components: {
            clock: {
                type: "berg.clock.raf"
            }
        },

        listeners: {
            "onPlay.resetPreviousTime": {
                priority: "before:startClock",
                funcName: "aconite.videoPlayer.manualOnline.resetPreviousTime",
                args: ["{that}"]
            }
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
})();
