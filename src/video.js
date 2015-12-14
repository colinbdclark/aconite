/*
 * Aconite Video
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite, jQuery*/

(function () {
    "use strict";

    fluid.defaults("aconite.video", {
        gradeNames: "fluid.modelComponent",

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
                    args: ["{that}", "{that}.model"]
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
                args: ["{that}.element", "{that}.model"],
                excludeSource: "init"
            }
        },

        events: {
            onVideoLoaded: null,
            onReady: null,
            onVideoEnded: null
        },

        url: "",

        templates: {
            video: "<video src='%url' muted='true'/>"
        }
    });

    aconite.video.composeURL = function (model) {
        return model.url + aconite.time.timeFragment(model);
    };

    aconite.video.renderVideoElement = function (that, model) {
        var url = aconite.video.composeURL(model),
            videoHTML = fluid.stringTemplate(that.options.templates.video, {
            url: url
        });

        var video = jQuery(videoHTML);

        video.one("canplay", function () {
            that.events.onReady.fire(that);
        });

        video.bind("canplay", function () {
            that.events.onVideoLoaded.fire(video);
        });

        video.bind("ended", function () {
            that.events.onVideoEnded.fire(video);
        });

        return video[0];
    };

    aconite.video.updateVideoURL = function (element, model) {
        element.src = aconite.video.composeURL(model);
    };

    aconite.video.isReady = function (that, videoEl) {
        return videoEl && videoEl.readyState === 4;
    };

    aconite.video.assignClip = function (vid, clip) {
        vid.applier.change("", clip);
    };
}());
