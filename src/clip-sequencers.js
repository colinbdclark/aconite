(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    /**
     * Sequences the playback of a colection of clips described by the "clipSequence" option
     */
    fluid.defaults("aconite.clipSequencer", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],

        model: {
            clipIdx: 0,
            clipSequence: []
        },

        invokers: {
            play: "{that}.events.onPlay.fire()",
            scheduleNextClip: "aconite.clipSequencer.scheduleNextClip({that})",
            refresh: "{that}.layer.refresh()"
        },

        components: {
            scheduler: {
                type: "flock.scheduler.async"
            },

            layer: {},

            preRoller: {
                type: "aconite.video"
            }
        },

        events: {
            onSequenceReady: null,
            onReady: null,
            onNextClip: null,
            onPlay: null
        },

        listeners: {
            onSequenceReady: [
                "aconite.clipSequencer.expandClips({that})",
                "aconite.clipSequencer.prepareForPlay({that})",
                "{that}.events.onReady.fire()"
            ],

            onPlay: [
                "{that}.layer.play()",
                "{that}.scheduleNextClip()"
            ]
        },

        loop: false
    });

    aconite.clipSequencer.swapClips = function (source, preRoller, inTime) {
        var displayEl = source.element,
            preRollEl = preRoller.element,
            parsed = aconite.video.parseTimecode(inTime);

        preRollEl.currentTime = parsed === undefined ? 0 : parsed;
        preRollEl.play();
        displayEl.pause();

        source.element = preRollEl;
        preRoller.element = displayEl;
    };

    aconite.clipSequencer.displayClip = function (layer, clip, clipIdx, preRoller, onNextClip) {
        onNextClip.fire(clip, clipIdx);
        aconite.clipSequencer.swapClips(layer.source, preRoller, clip.inTime);
    };

    aconite.clipSequencer.nextClip = function (m, loop) {
        var nextIdx = m.clipIdx + 1;

        if (nextIdx >= m.clipSequence.length) {
            if (loop) {
                nextIdx = 0;
            } else {
                return;
            }
        }

        return m.clipSequence[nextIdx];
    };

    aconite.clipSequencer.scheduleClipDisplay = function (atTime, nextClip, that) {
        that.scheduler.once(atTime, function () {
            aconite.clipSequencer.displayClip(that.layer, nextClip, that.model.clipIdx, that.preRoller, that.events.onNextClip);
            that.model.clipIdx++;
            aconite.clipSequencer.scheduleNextClip(that);
        });
    };

    aconite.clipSequencer.calcDuration = function (clip) {
        if (clip.duration) {
            return clip.duration;
        }

        var inSecs = aconite.video.parseTimecode(clip.inTime),
            outSecs = aconite.video.parseTimecode(clip.outTime);

        return outSecs - inSecs;
    };

    aconite.clipSequencer.expandClip = function (clip) {
        clip.duration = aconite.clipSequencer.calcDuration(clip);
    };

    aconite.clipSequencer.expandClips = function (that) {
        fluid.each(that.model.clipSequence, aconite.clipSequencer.expandClip);
        that.applier.change("clipSequence", that.model.clipSequence);
    };

    // TODO: Split this up to reduce dependencies.
    aconite.clipSequencer.scheduleNextClip = function (that) {
        var m = that.model,
            idx = m.clipIdx >= m.clipSequence.length ? 0 : m.clipIdx,
            nextClip = aconite.clipSequencer.nextClip(m, that.options.loop),
            currentClip = m.clipSequence[idx];

        aconite.clipSequencer.expandClip(currentClip);

        if (!nextClip) {
            return;
        }

        aconite.video.assignClip(that.preRoller, nextClip);
        aconite.clipSequencer.scheduleClipDisplay(currentClip.duration, nextClip, that);
    };

    aconite.clipSequencer.prepareForPlay = function (that) {
        var firstClip = that.model.clipSequence[0];
        aconite.video.assignClip(that.preRoller, firstClip);
        aconite.video.assignClip(that.layer.source, firstClip);
        that.events.onNextClip.fire(firstClip, 0);
    };

    aconite.clipSequencer.mergeClipParams = function (clipSequence, defaultParams) {
        return fluid.transform(clipSequence, function (clip) {
            var defaults = defaultParams[clip.url];
            return $.extend(true, clip, defaults);
        });
    };

    fluid.defaults("aconite.clipSequencer.static", {
        gradeNames: ["aconite.clipSequencer", "autoInit"],

        listeners: {
            onCreate: {
                funcName: "{that}.events.onSequenceReady.fire"
            }
        }
    });

    fluid.defaults("aconite.clipSequencer.fcpxml", {
        gradeNames: ["aconite.clipSequencer", "autoInit"],

        components: {
            parser: {
                type: "aconite.fcpxmlParser",
                options: {
                    listeners: {
                        afterParsed: {
                            funcName: "{fcpxml}.events.onSequenceReady.fire",
                            args: ["{arguments}.0"]
                        },

                    }
                }
            }
        }
    });

    fluid.defaults("aconite.clipSequencer.clipMerger", {
        gradeNames: ["aconite.clipSequencer"],

        listeners: {
            onSequenceReady: [
                {
                    func: "{that}.applier.change",
                    args: ["clipSequence", {
                        expander: {
                            funcName: "aconite.clipSequencer.mergeClipParams",
                            args: ["{arguments}.0", "{that}.options.clipParams"]
                        }
                    }]
                },
                {
                    funcName: "{that}.events.onReady.fire"
                }
            ]
        }
    });

}());
