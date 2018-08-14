/*
 * Aconite Video
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2018, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.video", {
        gradeNames: "fluid.modelComponent",

        model: {
            inTime: 0,
            outTime: undefined,
            duration: undefined,
            frameRate: undefined,
            url: undefined,
            rate: 1.0,
            muted: true,

            // Derived from parsing in/out/duration times.
            inTimeSecs: undefined,
            durationSecs: undefined,
            outTimeSecs: undefined,

            // Derived from the video element.
            totalDuration: undefined
        },

        modelRelay: [
            {
                target: "inTimeSecs",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "aconite.time.inTime",
                    args: [
                        "{that}.model.inTime",
                        "{that}.model.frameRate"
                    ]
                }
            },

            {
                target: "durationSecs",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "aconite.time.parseTimecode",
                    args: [
                        "{that}.model.duration",
                        "{that}.model.frameRate"
                    ]
                }
            },

            {
                target: "outTimeSecs",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "aconite.video.calculateOutTime",
                    args: [
                        "{that}.model"
                    ]
                }
            }
        ],

        members: {
            element: {
                expander: {
                    funcName: "aconite.video.renderVideoElement",
                    args: ["{that}"]
                }
            }
        },

        invokers: {
            isReady: {
                funcName: "aconite.video.isReady",
                args: ["{that}", "{that}.element"]
            }
        },

        modelListeners: {
            muted: {
                funcName: "aconite.video.setAttribute",
                args: ["{that}", "muted", "{change}.value"]
            },

            // TODO: On Safari, it  appears that this needs to be
            // deferred until the video's "canplay" event fires,
            // otherwise it has no effect.
            inTimeSecs: {
                funcName: "aconite.video.setAttribute",
                args: ["{that}", "currentTime", "{change}.value"]
            },

            rate: {
                funcName: "aconite.video.setAttribute",
                args: ["{that}", "playbackRate", "{change}.value"]
            },

            url: [
                {
                    funcName: "aconite.video.setAttribute",
                    args: ["{that}", "src", "{change}.value"]
                },

                // Whenever the video's src changes,
                // we always need to update the currentTime.
                {
                    funcName: "aconite.video.setAttribute",
                    args: ["{that}", "currentTime", "{that}.model.inTimeSecs"]
                }
            ]
        },

        events: {
            onVideoElementRendered: null,
            onVideoLoaded: null,
            onDurationChange: null,
            onReady: null,
            onVideoEnded: null
        },

        listeners: {
            // In case we've got a video that we didn't render,
            // and which is already ready by the time we've
            // been created.
            "onCreate.checkAndFireReadyState": {
                priority: "before:bindVideoListeners",
                funcName: "aconite.video.checkAndFireReadyState",
                args: ["{that}"]
            },

            "onCreate.bindVideoListeners": {
                funcName: "aconite.video.bindVideoListeners",
                args: ["{that}.events", "{that}.element"]
            },

            "onDurationChange.updateTotalDuration": {
                changePath: "totalDuration",
                value: "{that}.element.duration"
            },

            // A hack to work around the fact that Safari
            // won't allow modification of currentTime until the
            // video is ready to play.
            "onReady.resetCurrentTime": {
                priority: "first",
                funcName: "aconite.video.setAttribute",
                args: ["{that}", "currentTime", "{that}.model.inTimeSecs"]
            }
        },

        markup: {
            video: "<video />"
        }
    });

    aconite.video.checkAndFireReadyState = function (that) {
        if (that.isReady()) {
            // Avoid Zalgo until Infusion is immune.
            fluid.invokeLater(that.events.onReady.fire);
        }
    };

    aconite.video.calculateOutTime = function (m) {
        var parsedOutTime = aconite.time.parseTimecode(m.outTime, m.frameRate);

        if ((!parsedOutTime || isNaN(parsedOutTime)) && (m.durationSecs || m.totalDuration)) {
            var duration = m.durationSecs || m.totalDuration;
            return duration - m.inTimeSecs;
        }

        return parsedOutTime;
    };

    aconite.video.bindVideoListeners = function (events, video) {
        var jVideo = jQuery(video);

        jVideo.bind("durationchange", function () {
            events.onDurationChange.fire();
        });

        jVideo.one("canplaythrough", function () {
            events.onReady.fire();
        });

        jVideo.bind("canplaythrough", function () {
            events.onVideoLoaded.fire(video);
        });

        jVideo.bind("ended", function () {
            events.onVideoEnded.fire(video);
        });
    };

    aconite.video.renderVideoElement = function (that) {
        var video = jQuery(that.options.markup.video);
        that.events.onVideoElementRendered.fire(video);

        return video[0];
    };

    aconite.video.isReady = function (that, videoEl) {
        return videoEl && videoEl.readyState === 4;
    };

    aconite.video.assignClip = function (that, clip) {
        that.applier.change("", clip);
    };

    aconite.video.setAttribute = function (that, propName, value) {
        // TODO: This may be problematic in future cases where
        // one might want to remove an attribute,
        // but it is here in order to deal with the fact that it's
        // possible to legitimately have a video for which we don't want
        // to set an attribute at all.
        // (e.g. because a pre-existing video element is specified).
        if (value === null || value === undefined) {
            return;
        }

        that.element[propName] = value;
    };
})();
