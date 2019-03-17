/*
 * Aconite Video Tests
 *
 * Copyright 2018, Colin Clark
 * Licensed under the MIT and GPL 3 licenses.
 */

/*global require, aconite*/

var fluid = fluid || require("infusion"),
    jqUnit = jqUnit || require("node-jqunit");

(function () {
    "use strict";

    fluid.defaults("aconite.test.video.testEnvironment", {
        gradeNames: "fluid.test.testEnvironment",

        components: {
            video: {
                createOnEvent: "onCreateVideo",
                type: "aconite.video",
                options: {
                    model: {
                        url: "../videos/lichen-03-720p.mp4",
                        inTime: "00:00:00:03",
                        outTime: 0.2,
                        frameRate: 30
                    }
                }
            },

            tester: {
                type: "aconite.test.video.tester"
            }
        },

        events: {
            onCreateVideo: null
        }
    });

    fluid.defaults("aconite.test.video.tester", {
        gradeNames: "fluid.test.testCaseHolder",

        modules: [
            {
                name: "Modelized video attributes",
                tests: [
                    {
                        name: "currentTime attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "{testEnvironment}.events.onCreateVideo.fire"
                            },
                            {
                                event: "{testEnvironment aconite.video}.events.onReady",
                                listener: "aconite.test.video.tester.testCurrentTimeDefault",
                                args: ["{video}"]
                            }
                        ]
                    },
                    {
                        name: "currentTime attribute is updated accordingly.",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["inTime", 0.5]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The currentTime attribute should be 0.5.",
                                    0.5,
                                    "{video}.element.currentTime"
                                ]
                            }
                        ]
                    },
                    {
                        name: "totalDuration is set correctly to the video's duration.",
                        expect: 2,
                        sequence: [
                            {
                                funcName: "aconite.test.video.tester.testDuration",
                                args: ["{video}"]
                            }
                        ]
                    },
                    {
                        name: "The muted attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "jqUnit.assertFalse",
                                args: [
                                    "The muted attribute should be false.",
                                    "{video}.element.muted"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Muted attribute is updated accordingly.",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["muted", true]
                            },
                            {
                                funcName: "jqUnit.assertTrue",
                                args: [
                                    "The muted attribute should be true.",
                                    "{video}.element.muted"
                                ]
                            }
                        ]
                    },
                    {
                        name: "The volume attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The volume attribute should be 0.0.",
                                    0.0,
                                    "{video}.element.volume"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Volume attribute is updated accordingly.",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["volume", 0.5]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The volume attribute should be false.",
                                    0.5,
                                    "{video}.element.volume"
                                ]
                            }
                        ]
                    },
                    {
                        name: "playbackRate attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The playbackRate attribute should be 1.0.",
                                    1.0,
                                    "{video}.element.playbackRate"
                                ]
                            }
                        ]
                    },
                    {
                        name: "playbackRate attribute is updated accordingly.",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["rate", 0.5]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The playbackRate attribute should be 0.5.",
                                    0.5,
                                    "{video}.element.playbackRate"
                                ]
                            }
                        ]
                    },

                    // Note that changes to the "src" attribute
                    // will cause other properties to be updated,
                    // possibly asynchronously after "onReady" is
                    // fired. This is why
                    // (due to poor test factoring)
                    // these tests are at the end of the sequence.
                    {
                        name: "src attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "aconite.test.video.tester.assertRelativeURLEquals",
                                args: [
                                    "The src attribute should correspond to the URL specified in the model at creation time.",
                                    "../videos/lichen-03-720p.mp4",
                                    "{video}.element.src"
                                ]
                            }
                        ]
                    },
                    {
                        name: "src attribute is updated accordingly.",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["url", "../videos/lichen-01-720p.mp4"]
                            },
                            {
                                funcName: "aconite.test.video.tester.assertRelativeURLEquals",
                                args: [
                                    "The src attribute should be updated to the new url.",
                                    "../videos/lichen-01-720p.mp4",
                                    "{video}.element.src"
                                ]
                            }
                        ]
                    },
                    {
                        name: "duration timecode is parsed and relayed, default 30 fps frame rate",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["", {
                                    frameRate: null,
                                    outTime: null,
                                    inTime: 10,
                                    duration: "00:01:11:15"
                                }]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The outTimeSecs attribute should be 81.5",
                                    81.5,
                                    "{video}.model.outTimeSecs"
                                ]
                            }
                        ]
                    },
                    {
                        name: "duration timecode is parsed and relayed, 24 fps frame rate",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["", {
                                    frameRate: 24,
                                    inTime: 0.5,
                                    duration: "00:00:10:12"
                                }]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The outTimeSecs attribute should be 11",
                                    11,
                                    "{video}.model.outTimeSecs"
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    aconite.test.video.tester.testCurrentTimeDefault = function (video) {
        jqUnit.assertEquals("The currentTime attribute should be 0.1.",
            0.1, video.element.currentTime);
    };

    aconite.test.video.tester.testDuration = function (video) {
        jqUnit.assertNotUndefined("The totalDuration should not be undefined", video.model.totalDuration);
        jqUnit.assertEquals("The totalDuration model property should match the video's duration.", video.element.duration, video.model.totalDuration);
    };

    aconite.test.video.tester.getAbsoluteURL = function (url) {
        var link = document.createElement("a");
        link.href = url;

        return link.href;
    };

    aconite.test.video.tester.assertRelativeURLEquals = function (msg, relativeExpected, actual) {
        var absoluteExpected = aconite.test.video.tester.getAbsoluteURL(relativeExpected);
        jqUnit.assertEquals(msg, absoluteExpected, actual);
    };

    fluid.defaults("aconite.test.video.modelRelays.testEnvironment", {
        gradeNames: "fluid.test.testEnvironment",

        components: {
            allTimeCodeVideo: {
                type: "aconite.video",
                options: {
                    model: {
                        url: "../videos/lichen-03-720p.mp4",
                        inTime: "00:00:00:03",
                        outTime: "00:00:00:06",
                        frameRate: 30
                    }
                }
            },

            noOutTimeVideo: {
                type: "aconite.video",
                options: {
                    model: {
                        url: "../videos/lichen-01-720p.mp4",
                        inTime: "00:00:00:03",
                        frameRate: 30
                    }
                }
            },

            tester: {
                type: "aconite.test.video.modelRelays.tester"
            }
        }
    });

    fluid.defaults("aconite.test.video.modelRelays.tester", {
        gradeNames: "fluid.test.testCaseHolder",

        invokers: {
            testOutTime: {
                funcName: "aconite.test.video.modelRelays.testOutTime",
                args: "{noOutTimeVideo}"
            }
        },

        modules: [
            {
                name: "Derived model attributes",
                tests: [
                    {
                        name: "In and out timecode should be correctly parsed.",
                        expect: 2,
                        sequence: [
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The inTime attribute should be parsed correctly in seconds.",
                                    0.1,
                                    "{allTimeCodeVideo}.model.inTimeSecs"
                                ]
                            },
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The outTime attribute should be parsed correctly in seconds.",
                                    0.2,
                                    "{allTimeCodeVideo}.model.outTimeSecs"
                                ]
                            }
                        ]
                    },
                    {
                        name: "The video's totalDuration should be used to determine the clip's outTimeSecs.",
                        expect: 2,
                        sequence: [
                            {
                                // Note: it would be reasonable
                                // to listen for "onDurationChange",
                                // which is fired by Chrome and Safari
                                // when preparing a video to be played.
                                // However, Firefox does not fire this
                                // event at initialization time.
                                // Hence, we listen for
                                // "onReady" instead.
                                event: "{noOutTimeVideo}.events.onReady",
                                listener: "{that}.testOutTime"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    aconite.test.video.modelRelays.testOutTime = function (video) {
        jqUnit.assertNotUndefined("The outTimeSecs model property should not be undefined", video.model.outTimeSecs);
        jqUnit.assertEquals("outTimeSecs should correspond to the totalDuration, less the inTimeSecs", video.model.totalDuration - 0.1, video.model.outTimeSecs);
    };

    fluid.test.runTests("aconite.test.video.testEnvironment");
    fluid.test.runTests("aconite.test.video.modelRelays.testEnvironment");

})();
