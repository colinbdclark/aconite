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

        url: "",

        model: {
            inTime: null,
            outTime: null,
            duration: null,
            url: "{that}.options.url"
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
            setURL: "{that}.applier.change(url, {arguments}.0)",

            isReady: {
                funcName: "aconite.video.isReady",
                args: ["{that}", "{that}.element"]
            }
        },

        modelListeners: {
            "*": {
                funcName: "aconite.video.updateVideoURL",
                args: ["{that}"],
                excludeSource: "init"
            }
        },

        events: {
            onVideoLoaded: null,
            onReady: null,
            onVideoEnded: null
        },

        listeners: {
            "onCreate.bindVideoListeners": {
                funcName: "aconite.video.bindVideoListeners",
                args: ["{that}", "{that}.element"]
            }
        },

        templates: {
            video: "<video src='%url' muted='true'/>"
        }
    });

    aconite.video.composeURL = function (that) {
        // TODO: The lifecycle of composing URLs is seriously broken!
        var url = that.model ? that.model.url : that.options.url;
        return url + aconite.time.timeFragment(that.model);
    };

    aconite.video.bindVideoListeners = function (that, video) {
        var jVideo = jQuery(video);

        jVideo.one("canplay", function () {
            that.events.onReady.fire(that);
        });

        jVideo.bind("canplay", function () {
            that.events.onVideoLoaded.fire(video);
        });

        jVideo.bind("ended", function () {
            that.events.onVideoEnded.fire(video);
        });
    };

    aconite.video.renderVideoElement = function (that) {
        var url = aconite.video.composeURL(that),
            videoHTML = fluid.stringTemplate(that.options.templates.video, {
                url: url
            });

        var video = jQuery(videoHTML);

        return video[0];
    };

    aconite.video.updateVideoURL = function (that) {
        that.element.src = aconite.video.composeURL(that);
    };

    aconite.video.isReady = function (that, videoEl) {
        return videoEl && videoEl.readyState === 4;
    };

    aconite.video.assignClip = function (vid, clip) {
        vid.applier.change("", clip);
    };
})();
