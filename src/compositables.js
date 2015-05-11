(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    fluid.defaults("aconite.texture", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],

        members: {
            gl: null
        },

        events: {
            onTextureReady: null
        },

        listeners: {
            onCreate: {
                funcName: "aconite.texture.create",
                args: ["{that}"]
            }
        },

        parameters: {
            "TEXTURE_WRAP_S": "CLAMP_TO_EDGE",
            "TEXTURE_WRAP_T": "CLAMP_TO_EDGE",
            "TEXTURE_MIN_FILTER": "NEAREST",
            "TEXTURE_MAG_FILTER": "NEAREST"
        },

        bindToTextureUnit: "TEXTURE0"
    });

    aconite.texture.create = function (that) {
        // TODO: Figure out why this doesn't work as a member expander.
        var gl = that.gl,
            texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        fluid.each(that.options.parameters, function (value, key) {
            gl.texParameteri(gl.TEXTURE_2D, gl[key], gl[value]);
        });

        gl.bindTexture(gl.TEXTURE_2D, null);

        that.texture = texture;
        that.events.onTextureReady.fire(texture);

        return texture;
    };

    fluid.defaults("aconite.video", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],

        model: {
            inTime: null,
            outTime: null,
            duration: null,
            url: "{that}.options.url"
        },

        members: {
            element: {
                expander: {
                    funcName: "aconite.video.setupVideo",
                    args: ["{that}", "{that}.model"]
                }
            }
        },

        invokers: {
            play: {
                "this": "{that}.element",
                method: "play"
            },

            pause: {
                "this": "{that}.element",
                method: "pause"
            },

            setURL: "{that}.applier.change(url, {arguments}.0)",

            isReady: {
                funcName: "aconite.video.isReady",
                args: ["{that}", "{that}.element"]
            }
        },

        modelListeners: {
            "*": "aconite.video.updateVideoURL({that})"
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

    aconite.video.renderVideo = function (that, model) {
        var url = aconite.video.composeURL(model),
            videoHTML = fluid.stringTemplate(that.options.templates.video, {
            url: url
        });

        var video = $(videoHTML);

        video.bind("canplay", function () {
            that.events.onVideoLoaded.fire(video);
        });

        video.bind("ended", function () {
            that.events.onVideoEnded.fire(video);
        });

        return video[0];
    };

    aconite.video.setupVideo = function (that, url) {
        var video = aconite.video.renderVideo(that, url);

        var once = function (e) {
            that.events.onReady.fire(that);
            video.removeEventListener("canplay", once, true);
        };

        video.addEventListener("canplay", once, true);

        return video;
    };

    // TODO: Properly modelize this.
    aconite.video.updateVideoURL = function (that) {
        that.element.src = aconite.video.composeURL(that.model);
        return that.element;
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
        } else if (typeof clip.inTime === "number" && typeof clip.duration == "number") {
            inTime = clip.inTime;
            outTime = inTime + clip.duration;
        }

        return inTime !== undefined ? frag + inTime + "," + outTime : "";
    };

    aconite.video.assignClip = function (vid, clip) {
        var url = clip.url + aconite.video.createTimeFragment(clip);
        vid.setURL(url);
    };

    fluid.defaults("aconite.compositable", {
        gradeNames: ["aconite.texture", "autoInit"],

        components: {
            source: {}
        },

        invokers: {
            refresh: {
                funcName: "aconite.compositable.refresh",
                args: ["{that}.gl", "{that}.source", "{that}.texture", "{that}.options.bindToTextureUnit"]
            }
        }
    });

    aconite.compositable.refresh = function (gl, source, texture, textureUnit) {
        if (!source.isReady()) {
            return;
        }

        gl.activeTexture(gl[textureUnit]);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source.element);
    };

    fluid.defaults("aconite.compositableVideo", {
        gradeNames: ["aconite.compositable", "autoInit"],

        invokers: {
            play: "{that}.source.play()",
            pause: "{that}.source.pause()"
        },

        components: {
            source: {
                type: "aconite.video"
            }
        }
    });

    fluid.defaults("aconite.compositableVideo.layer", {
        gradeNames: ["aconite.compositableVideo"],
        members: {
            gl: "{glRenderer}.gl"
        },

        bindToTextureUnit: "TEXTURE0"
    });

}());
