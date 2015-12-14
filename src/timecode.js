/*
 * Aconite Timecode Utilities
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite*/

(function () {
    "use strict";

    fluid.registerNamespace("aconite.time");

    // Unsupported, non-API function.
    aconite.time.isValidTimeSegment = function (seg) {
        return (!isNaN(seg) && seg < Infinity && seg >= 0);
    };

    // Unsupported, non-API function.
    aconite.time.throwOnInvalidTimeSegment = function (segment, segmentType, time) {
        if (!aconite.time.isValidTimeSegment(segment)) {
            throw new Error("Error while parsing timecode string. " +
                "Invalid '" + segmentType + "' segment specified. " +
                "Timecode string was: " + time);
        }
    };

    // Unsupported, non-API function.
    aconite.time.inTime = function (timeSpec) {
        var inTime = aconite.time.asNumber(timeSpec.inTime, timeSpec.frameRate);
        return isNaN(inTime) ? 0 : inTime;
    };

    // Unsupported, non-API function.
    aconite.time.outTime = function (timeSpec, parsedInTime) {
        return timeSpec.outTime !== undefined ?
            aconite.time.asNumber(timeSpec.outTime, timeSpec.frameRate) :
            parsedInTime + aconite.time.asNumber(timeSpec.duration, timeSpec.frameRate);
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
        frameRate = frameRate === undefined ? 30 : frameRate;

        var type = typeof timecode;
        if (type === "number") {
            return timecode;
        } else if (type !== "string") {
            throw new Error("An invalid 'timecode' argument was specified. " +
                "Expected string or number." + "Timecode was: " + fluid.prettyPrintJSON(timecode));
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

        aconite.time.throwOnInvalidTimeSegment(hours, "hours", timecode);
        aconite.time.throwOnInvalidTimeSegment(minutes, "minutes", timecode);
        aconite.time.throwOnInvalidTimeSegment(seconds, "seconds", timecode);

        if (segs.length === 4) {
            frames = Number(segs[3]);
            aconite.time.throwOnInvalidTimeSegment(frames, "frames", timecode);
        }

        return ((1 / frameRate) * frames) + seconds + (minutes * 60) + (hours * 3600);
    };

    /**
     * Converts a time value to a Number.
     *
     * If the time isn't a SMPTE-compatible timecode or a number,
     * this function will return NaN.
     *
     * If the time code is specified as a string but isn't in a valid SMPTE format,
     * this function will throw an Error.
     *
     * @param {Number|String} time the time value to convert
     * @param {Number} [optional] frameRate the frame rate (defaults to 30 fps)
     * @return {Number} the converted number
     */
    aconite.time.asNumber = function (time, frameRate) {
        var type = typeof time;
        return type === "string" ? aconite.time.parseTimecode(time, frameRate) :
            type === "number" ? time : NaN;
    };

    /**
     * Creates a fragment URL for the specified time.
     * For more information on time fragments, see
     *    http://www.w3.org/TR/media-frags/#naming-time
     *
     * A time specification object can contain the following keys:
     *   - inTime {Number|Timecode String} the start time for the time fragment
     *   - outTime {Number|Timecode String} [optional] the end time;
                takes priority over duration if both are specified.
     *   - duration {Number|TimecodeString} [optional] the duration of the clip
     *   - frameRate {Number} [optional] the frame rate at which to do timecode conversions;
                defaults to 30 fps.
     *
     * @param {TimeSpec} timeSpec the time specification to create the URL fragment for
     * @return {String} a URL time fragment
     */
    aconite.time.timeFragment = function (timeSpec) {
        if (timeSpec.inTime === undefined && timeSpec.duration === undefined) {
            return "";
        }

        var frag = "#t=",
            inTime = aconite.time.inTime(timeSpec),
            outTime = aconite.time.outTime(timeSpec, inTime);

        frag += inTime;

        return isNaN(outTime) ? frag : frag + "," + outTime;
    };
}());
