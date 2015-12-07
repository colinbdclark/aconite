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

    // TODO: Harmonize this with other time fragment code elsewhere.
    aconite.video.composeURL = function (model) {
        var timeFrag = "";

        if (aconite.video.isTimeUnit(model.inTime)) {
            timeFrag += "#t=" + model.inTime;
            if (aconite.video.isTimeUnit(model.outTime)) {
                timeFrag += "," + model.outTime;
            } else if (typeof model.duration === "number") {
                timeFrag += "," + aconite.video.parseTimecode(model.inTime) + model.duration;
            }
        }

        return model.url + timeFrag;
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

    // TODO: Expand this to match the constraints of the specification more closely.
    // http://www.w3.org/TR/media-frags/#naming-time
    aconite.video.isTimeUnit = function (time) {
        var timeType = typeof time;
        return (timeType === "string" || timeType === "number");
    };

    aconite.video.isValidTimeSegment = function (seg) {
        return (!isNaN(seg) && seg < Infinity && seg >= 0);
    };

    aconite.video.parseTimecode = function (time) {
        if (typeof time !== "string") {
            return time;
        }

        var segs = time.split(":");
        if (segs.length === 4) {
            fluid.log(fluid.logLevel.WARN, "Aconite doesn't yet support frame-specific SMPTE time codes. " +
                "The frame position will be ignored. Timecode was: " + time);
        } else if (segs.length < 3) {
            throw new Error("Invalid timecode: " + time);
        }

        var seconds = Number(segs[2]),
            minutes = Number(segs[1]),
            hours = Number(segs[0]);

        if (!aconite.video.isValidTimeSegment(seconds) ||
            !aconite.video.isValidTimeSegment(minutes) ||
            !aconite.video.isValidTimeSegment(hours)) {
            throw new Error("Invalid timecode: " + time);
        }

        return seconds + (minutes * 60) + (hours * 3600);
    };

    aconite.video.createTimeFragment = function (clip) {
        var frag = "#t=",
            inTime,
            outTime;

        if (aconite.video.isTimeUnit(clip.inTime) && aconite.video.isTimeUnit(clip.outTime)) {
            inTime = clip.inTime;
            outTime = clip.outTime;
        } else if (typeof clip.inTime === "number" && typeof clip.duration === "number") {
            inTime = clip.inTime;
            outTime = inTime + clip.duration;
        }

        return inTime !== undefined ? frag + inTime + "," + outTime : "";
    };

    aconite.video.assignClip = function (vid, clip) {
        var url = clip.url + aconite.video.createTimeFragment(clip);
        vid.setURL(url);
    };
}());
