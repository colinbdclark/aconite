/*
 * Aconite Video
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.video", {
        gradeNames: "fluid.modelComponent",

        model: {
            inTime: null,
            outTime: null,
            duration: null,
            url: null,
            composedURL: null,
            rate: 1.0
        },

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

        modelRelay: {
            target: "composedURL",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "aconite.video.composeURL",
                args: [
                    "{that}.model.url",
                    "{that}.model.inTime",
                    "{that}.model.outTime",
                    "{that}.model.duration"
                ]
            }
        },

        modelListeners: {
            composedURL: {
                funcName: "aconite.video.setVideoURL",
                args: ["{that}.element", "{change}.value"]
            },

            rate: "aconite.video.updatePlaybackRate({that})"
        },

        events: {
            onVideoLoaded: null,
            onReady: null,
            onVideoEnded: null
        },

        listeners: {
            "onCreate.bindVideoListeners": {
                funcName: "aconite.video.bindVideoListeners",
                args: ["{that}.events", "{that}.element"]
            }
        },

        markup: {
            video: "<video muted='true'/>"
        }
    });

    aconite.video.composeURL = function (url, inTime, outTime, duration) {
        if (url === null || url === undefined) {
            return;
        }

        var timeSpec = {
            inTime: inTime,
            outTime: outTime,
            duration: duration
        };

        return url + aconite.time.timeFragment(timeSpec);
    };

    aconite.video.setVideoURL = function (element, composedURL) {
        if (composedURL == null || composedURL === undefined) {
            return;
        }

        element.src = composedURL;
    };

    aconite.video.bindVideoListeners = function (events, video) {
        var jVideo = jQuery(video);

        jVideo.one("canplay", function () {
            events.onReady.fire();
        });

        jVideo.bind("canplay", function () {
            events.onVideoLoaded.fire(video);
        });

        jVideo.bind("ended", function () {
            events.onVideoEnded.fire(video);
        });
    };

    aconite.video.renderVideoElement = function (that) {
        var video = jQuery(that.options.markup.video);
        return video[0];
    };

    aconite.video.updatePlaybackRate = function (that) {
        that.element.playbackRate = that.model.rate;
    };

    aconite.video.isReady = function (that, videoEl) {
        return videoEl && videoEl.readyState === 4;
    };

    aconite.video.assignClip = function (vid, clip) {
        vid.applier.change("", clip);
    };
})();
