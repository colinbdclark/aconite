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
            start: {
                funcName: "aconite.clipSequencer.start",
                args: [
                    "{that}.model",
                    "{that}.scheduler",
                    "{that}.layer",
                    "{that}.preRoller",
                    "{that}.events.onNextClip",
                    "{that}.options.loop"
                ]
            }
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
            onNextClip: null
        },

        listeners: {
            onSequenceReady: {
                funcName: "{that}.events.onReady.fire"
            }
        },

        loop: false
    });

    aconite.clipSequencer.swapClips = function (source, preRoller, inTime) {
        var displayEl = source.element,
            preRollEl = preRoller.element;

        preRollEl.currentTime = inTime === undefined ? 0 : inTime;
        preRollEl.play();
        displayEl.pause();

        source.element = preRollEl;
        preRoller.element = displayEl;
    };

    aconite.clipSequencer.displayClip = function (layer, clip, preRoller, onNextClip) {
        onNextClip.fire(clip);
        aconite.clipSequencer.swapClips(layer.source, preRoller, clip.inTime);
    };

    aconite.clipSequencer.preRollClip = function (preRoller, clip) {
        var url = clip.url,
            inTime = clip.inTime;

        if (clip.inTime) {
            url = url + "#t=" + inTime + "," + (inTime + clip.duration);
        }

        preRoller.setURL(url);
    };

    aconite.clipSequencer.nextClip = function (model, sequence, loop) {
        var nextIdx = model.clipIdx + 1;

        if (nextIdx >= sequence.length) {
            if (loop) {
                nextIdx = 0;
            } else {
                return;
            }
        }

        return sequence[nextIdx];
    };

    aconite.clipSequencer.start = function (model, scheduler, layer, preRoller, onNextClip, loop) {
        var idx = model.clipIdx = 0,
            sequence = model.clipSequence;

        layer.source.element.play();
        aconite.clipSequencer.scheduleNextClip(model, sequence, scheduler, layer, preRoller, onNextClip, loop);
    };

    // TODO: Split this up to reduce dependencies.
    aconite.clipSequencer.scheduleNextClip = function (model, sequence, scheduler, layer, preRoller, onNextClip, loop) {
        var idx = model.clipIdx >= sequence.length ? 0 : model.clipIdx,
            nextClip = aconite.clipSequencer.nextClip(model, sequence, loop),
            currentClip = sequence[idx];

        if (!nextClip) {
            return;
        }

        aconite.clipSequencer.preRollClip(preRoller, nextClip);
        scheduler.once(currentClip.duration, function () {
            aconite.clipSequencer.displayClip(layer, nextClip, preRoller, onNextClip);
            model.clipIdx++;
            aconite.clipSequencer.scheduleNextClip(model, sequence, scheduler, layer, preRoller, onNextClip, loop);
        });
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
