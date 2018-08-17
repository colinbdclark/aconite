/*
 * Aconite Timecode Utilities
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.registerNamespace("aconite.time");

    // Unsupported, non-API function.
    aconite.time.isValidTimeSegment = function (seg) {
        return (typeof (seg) === "number" && !isNaN(seg) && seg < Infinity && seg >= 0);
    };

    // Unsupported, non-API function.
    aconite.time.throwIfInvalidTimeSegment = function (segment, segmentType, time) {
        if (!aconite.time.isValidTimeSegment(segment)) {
            throw new Error("Error while parsing timecode string. " +
                "Invalid '" + segmentType + "' segment specified. " +
                "Timecode string was: " + time);
        }
    };

    /**
     * Parses a SMPTE timecode string in the format 'hh:mm:ss' or 'hh:mm:ss:ff'
     * and returns the number of seconds it represents.
     *
     * Note that this function doesn't currently support drop frame formats.
     *
     * @param {string} time a SMPTE timecode string
     * @param {Number} frameRate the reference frame rate
     * @returns {Number} the time in seconds
     */
    aconite.time.parseTimecode = function (timecode, frameRate) {
        frameRate = (frameRate === undefined || frameRate === null) ? 30 : frameRate;

        var type = typeof timecode;
        if (type === "number") {
            return timecode;
        } else if (type !== "string") {
            return NaN;
        }

        if (timecode.indexOf(";") > -1) {
            throw new Error("Drop frame timecodes are not currently supported. "  +
                "Timecode was: " + timecode);
        }

        var segs = timecode.split(":");
        if (segs.length < 3 || segs.length > 4) {
            throw new Error("Error while parsing timecode string. " +
                "Timecodes must be in the format 'hh:mm:ss' or 'hh:mm:ss:ff'. " +
                "Timecode was: " + timecode);
        }

        var seconds = Number(segs[2]),
            minutes = Number(segs[1]),
            hours = Number(segs[0]),
            frames = 0;

        aconite.time.throwIfInvalidTimeSegment(hours, "hours", timecode);
        aconite.time.throwIfInvalidTimeSegment(minutes, "minutes", timecode);
        aconite.time.throwIfInvalidTimeSegment(seconds, "seconds", timecode);

        if (segs.length === 4) {
            frames = Number(segs[3]);
            aconite.time.throwIfInvalidTimeSegment(frames, "frames", timecode);
        }

        return ((1 / frameRate) * frames) + seconds + (minutes * 60) + (hours * 3600);
    };

    aconite.time.timeRangeNotValid = function (timeSpec) {
        return (timeSpec.inTime === null || timeSpec.inTime === undefined) && (timeSpec.duration === null || timeSpec.duration === undefined);
    };
})();
