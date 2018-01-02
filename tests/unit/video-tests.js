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
                type: "aconite.video",
                options: {
                    model: {
                        url: "../videos/lichen-03-720p.mp4",
                        inTime: 0.1,
                        outTime: 0.2
                    }
                }
            },

            tester: {
                type: "aconite.test.video.tester"
            }
        }
    });

    fluid.defaults("aconite.test.video.tester", {
        gradeNames: "fluid.test.testCaseHolder",

        modules: [
            {
                name: "Modelized video attributes",
                tests: [
                    {
                        name: "Muted attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
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
                        name: "Muted attribute is updated accordingly.",
                        expect: 1,
                        sequence: [
                            {
                                func: "{video}.applier.change",
                                args: ["muted", false]
                            },
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
                    {
                        name: "src attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "aconite.test.video.tester.assertRelativeURLEquals",
                                args: [
                                    "The playbackRate attribute should be 1.0.",
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
                        name: "currentTime attribute is set correctly to the default.",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "jqUnit.assertEquals",
                                args: [
                                    "The currentTime attribute should be 0.1.",
                                    0.1,
                                    "{video}.element.currentTime"
                                ]
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
                    }
                ]
            }
        ]
    });

    aconite.test.video.tester.getAbsoluteURL = function (url) {
        var link = document.createElement("a");
        link.href = url;

        return link.href;
    };

    aconite.test.video.tester.assertRelativeURLEquals = function (msg, relativeExpected, actual) {
        var absoluteExpected = aconite.test.video.tester.getAbsoluteURL(relativeExpected);
        jqUnit.assertEquals(msg, absoluteExpected, actual);
    };

    fluid.test.runTests("aconite.test.video.testEnvironment");
})();
