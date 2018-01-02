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
            url: undefined,
            rate: 1.0,
            muted: true
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

        modelListeners: {
            muted: {
                funcName: "aconite.video.setAttribute",
                args: ["{that}", "muted", "{change}.value"]
            },

            inTime: {
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
                    args: ["{that}", "currentTime", "{that}.model.inTime"]
                }
            ]
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
            video: "<video />"
        }
    });

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

    aconite.video.isReady = function (that, videoEl) {
        return videoEl && videoEl.readyState === 4;
    };

    aconite.video.assignClip = function (that, clip) {
        that.applier.change("", clip);
    };

    aconite.video.setAttribute = function (that, propName, value) {
        // TODO: This may be problematic in future cases where
        // one might legitimately want to clear out an attribute,
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
