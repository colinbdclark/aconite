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

    fluid.defaults("aconite.videoPlayer", {
        gradeNames: "fluid.modelComponent",

        model: {
            rate: 1.0,
            loop: false,
            isPlaying: false
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


    /**
     * A Video Player that uses the underlying HTML video element's
     * own playback functionality directly.
     */
    fluid.defaults("aconite.videoPlayer.nativeElement", {
        gradeNames: "aconite.videoPlayer",

        components: {
            timelineNotifier: {
                type: "aconite.videoTimelineNotifier",
                options: {
                    components: {
                        video: "{nativeElement}.video"
                    },

                    events: {
                        onClipIn: "{nativeElement}.events.onClipIn",
                        onClipOut: "{nativeElement}.events.onClipOut"
                    }
                }
            }
        },

        events: {
            onClipIn: null,
            onClipOut: null
        },

        listeners: {
            "onPlay.playVideoElement": {
                this: "{that}.video.element",
                method: "play"
            },

            "onPlay.startNotifier": "{that}.timelineNotifier.start()",

            "onClipIn.handleInPoint": {
                funcName: "aconite.videoPlayer.nativeElement.inPoint",
                args: ["{that}"]
            },

            "onClipOut.handleOutPoint": {
                funcName: "aconite.videoPlayer.nativeElement.outPoint",
                args: ["{that}"]
            },

            "onPause.pauseVideoElement": {
                this: "{that}.video.element",
                method: "pause"
            },

            "onPause.stopNotifier": "{that}.timelineNotifier.stop()"
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

    aconite.videoPlayer.nativeElement.inPoint = function (that) {
        var vidEl = that.video.element;

        if (vidEl.playbackRate < 0) {
            // We're playing backwards.
            if (that.model.loop) {
                if (!aconite.videoPlayer.nativeElement.canLoopNatively(that)) {
                    // Loop back to the out point.
                    vidEl.currentTime = that.video.model.outTime;
                }
            } else {
                that.pause();
            }
        }
    };

    aconite.videoPlayer.nativeElement.outPoint = function (that) {
        var vidEl = that.video.element;

        if (vidEl.playbackRate > 0) {
            if (that.model.loop) {
                if (!aconite.videoPlayer.nativeElement.canLoopNatively(that)) {
                    // Loop back to the out point.
                    vidEl.currentTime = that.video.model.inTime;
                }
            } else {
                that.pause();
            }
        }
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

            "onVideoEnded.handleOutPoint": {
                funcName: "aconite.videoPlayer.manual.handleOutPoint",
                args: ["{that}"]
            }
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


    aconite.videoPlayer.manual.handleOutPoint = function (that) {
        if (that.model.loop) {
            aconite.videoPlayer.seekToTime(that.model.inTime, that);
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
