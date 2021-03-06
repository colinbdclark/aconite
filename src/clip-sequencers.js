/*
 * Aconite Clip Sequencers
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    /**
     * Sequences the playback of a colection of clips described by the "clipSequence" option
     */
    fluid.defaults("aconite.clipSequencer", {
        gradeNames: [
            "fluid.modelComponent",
            "aconite.playable",
            "aconite.drawable"
        ],

        model: {
            clipIdx: 0,
            clipSequence: [],

            // TODO: This doesn't quite work as expected;
            // currently, it will enable looping through the
            // sequence itself, but does not cause the underlying
            // video clips to loop. So when cycling back to the beginning
            // of a sequence, the original clip may well have
            // reached its end and will not be playing.
            //
            // Should we support a second option, "clip loop"?
            loop: false
        },

        invokers: {
            play: "{that}.events.onPlay.fire()",
            pause: "{that}.events.onPause.fire()",
            scheduleNextClip: "aconite.clipSequencer.scheduleNextClip({that})",
            draw: "{that}.layer.draw()"
        },

        components: {
            scheduler: {
                type: "berg.scheduler",
                options: {
                    components: {
                        clock: "{animator}.clock"
                    }
                }
            },

            layer: {
                type: "fluid.mustBeOverridden"
            },

            preroller: {
                type: "aconite.video"
            }
        },

        events: {
            onSequenceReady: null,
            afterSequenceReady: null,
            onPlayersReady: {
                events: {
                    prerollerReady: "{preroller}.events.onReady",
                    layerReady: "{layer}.events.onReady"
                }
            },
            onReady: {
                events: {
                    afterSequenceReady: "{that}.events.afterSequenceReady",
                    onPlayersReady: "{that}.events.onPlayersReady"
                }
            },
            onNextClip: null,
            onPlay: null,
            onPause: null
        },

        listeners: {
            "onSequenceReady.expandClips": {
                funcName: "aconite.clipSequencer.expandClips",
                args: ["{that}"]
            },

            "onSequenceReady.prepareForPlay": {
                priority: "after:expandClips",
                funcName: "aconite.clipSequencer.prepareForPlay",
                args: ["{that}"]
            },

            "onSequenceReady.fireAfterSequenceReady": {
                priority: "after:prepareForPlay",
                func: "{that}.events.afterSequenceReady.fire"
            },

            "onPlay.playLayer": "{that}.layer.play()",

            "onPlay.scheduleNextClip": {
                priority: "after:playLayer",
                func: "{that}.scheduleNextClip"
            },

            "onPause.pauseLayer": "{that}.layer.pause()"
        }
    });

    aconite.clipSequencer.swapClips = function (player, preroller) {
        var displayEl = player.video.element,
            preRollEl = preroller.element;

        player.video.element = preRollEl;
        preroller.element = displayEl;
    };

    aconite.clipSequencer.displayClip = function (that, clip) {
        that.events.onNextClip.fire(clip);
        aconite.clipSequencer.swapClips(that.layer.player,
            that.preroller, clip);
        that.layer.player.play();
    };

    aconite.clipSequencer.displayNextClip = function (that, nextClip) {
        var nextClipIdx = that.model.clipIdx + 1;

        // TODO: Resolve this with the very similar logic below
        // in several places.
        if (nextClipIdx >= that.model.clipSequence.length && that.model.loop) {
            nextClipIdx = 0;
        }

        that.applier.change("clipIdx", nextClipIdx);
        aconite.clipSequencer.displayClip(that, nextClip);
        aconite.clipSequencer.scheduleNextClip(that);
    };

    aconite.clipSequencer.scheduleClipDisplay = function (atTime, nextClip, that) {
        that.scheduler.schedule({
            type: "once",
            time: atTime,
            callback: function () {
                aconite.clipSequencer.displayNextClip(that, nextClip);
            }
        });
    };

    aconite.clipSequencer.calcDuration = function (clip) {
        if (clip.duration) {
            return clip.duration;
        }

        var inSecs = aconite.time.parseTimecode(clip.inTime),
            outSecs = aconite.time.parseTimecode(clip.outTime);

        if (inSecs === undefined) {
            inSecs = 0;
        }

        if (outSecs === undefined) {
            fluid.fail("A clip was found with no duration or outTime. Please specify one. Clip: " +
                fluid.prettyPrintJSON(clip));
        }

        return outSecs - inSecs;
    };

    aconite.clipSequencer.expandClip = function (clip) {
        clip.duration = aconite.clipSequencer.calcDuration(clip);
    };

    aconite.clipSequencer.expandClips = function (that) {
        fluid.each(that.model.clipSequence, aconite.clipSequencer.expandClip);
        that.applier.change("clipSequence", that.model.clipSequence);
    };

    aconite.clipSequencer.nextClip = function (m) {
        var nextIdx = m.clipIdx + 1;

        if (nextIdx >= m.clipSequence.length) {
            if (m.loop) {
                nextIdx = 0;
            } else {
                return;
            }
        }

        return m.clipSequence[nextIdx];
    };

    // TODO: Split this up to reduce dependencies.
    aconite.clipSequencer.scheduleNextClip = function (that) {
        var m = that.model,
            idx = m.clipIdx >= m.clipSequence.length ? 0 : m.clipIdx,
            nextClip = aconite.clipSequencer.nextClip(m),
            currentClip = m.clipSequence[idx];

        aconite.clipSequencer.expandClip(currentClip);

        if (!nextClip) {
            return;
        }

        aconite.video.assignClip(that.preroller, nextClip);
        aconite.clipSequencer.scheduleClipDisplay(currentClip.duration, nextClip, that);
    };

    aconite.clipSequencer.prepareForPlay = function (that) {
        var firstClip = that.model.clipSequence[0];
        aconite.video.assignClip(that.preroller, firstClip);
        aconite.video.assignClip(that.layer.source, firstClip);
        that.events.onNextClip.fire(firstClip);
    };

    aconite.clipSequencer.mergeClipParams = function (clipSequence, defaultParams) {
        return fluid.transform(clipSequence, function (clip) {
            var defaults = defaultParams[clip.url];
            return jQuery.extend(true, clip, defaults);
        });
    };

    fluid.defaults("aconite.clipSequencer.static", {
        gradeNames: "aconite.clipSequencer",

        listeners: {
            onCreate: {
                func: "{that}.events.onSequenceReady.fire"
            }
        }
    });

    fluid.defaults("aconite.clipSequencer.fcpxml", {
        gradeNames: "aconite.clipSequencer",

        components: {
            parser: {
                type: "aconite.fcpxmlParser",
                options: {
                    listeners: {
                        "afterParsed.fireOnSequenceReady": {
                            funcName: "{fcpxml}.events.onSequenceReady.fire",
                            args: ["{arguments}.0"]
                        },

                    }
                }
            }
        }
    });

    fluid.defaults("aconite.clipSequencer.clipMerger", {
        gradeNames: "aconite.clipSequencer",

        listeners: {
            "onSequenceReady.mergeClipSequence": {
                priority: "before:fireAfterSequenceReady",
                func: "{that}.applier.change",
                args: [
                    "clipSequence",

                    {
                        expander: {
                            funcName: "aconite.clipSequencer.mergeClipParams",
                            args: ["{arguments}.0", "{that}.options.clipParams"]
                        }
                    }
                ]
            }
        }
    });
})();
