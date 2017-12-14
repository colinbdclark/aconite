/*
 * Aconite VideoPerformer Tests
 *
 * Copyright 2017, Colin Clark
 * Licensed under the MIT and GPL 3 licenses.
 */

/*global require, aconite*/

var fluid = fluid || require("infusion"),
    jqUnit = jqUnit || require("node-jqunit");

(function () {
    "use strict";

    fluid.defaults("aconite.test.videoPerformer.testEnvironment", {
        gradeNames: "fluid.test.testEnvironment",

        components: {
            videoPerformer: {
                type: "aconite.videoPerformer",
                options: {
                    model: {
                        loop: true
                    }
                }
            },

            tester: {
                type: "aconite.test.videoPerformer.tester"
            }
        }
    });

    fluid.defaults("aconite.test.videoPerformer.tester", {
        gradeNames: "fluid.test.testCaseHolder",

        modules: [
            {
                name: "Model relaying",
                tests: [
                    {
                        name: "Default model value is set correctly.",
                        expect: 3,
                        sequence: [
                            {
                                funcName: "jqUnit.assertTrue",
                                args: [
                                    "loop should be true on the parent.",
                                    "{videoPerformer}.model.loop"
                                ]
                            },
                            {
                                funcName: "jqUnit.assertTrue",
                                args: [
                                    "loop should be true on the video component.",
                                    "{videoPerformer}.source.model.loop"
                                ]
                            },
                            {
                                funcName: "jqUnit.assertTrue",
                                args: [
                                    "loop should be true on the videoPlayer component.",
                                    "{videoPerformer}.sourcePlayer.model.loop"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Updates propagate.",
                        expect: 6,
                        sequence: [
                            {
                                func: "{videoPerformer}.applier.change",
                                args: ["loop", false]
                            },
                            {
                                funcName: "jqUnit.assertFalse",
                                args: [
                                    "loop should be false on the parent.",
                                    "{videoPerformer}.model.loop"
                                ]
                            },
                            {
                                funcName: "jqUnit.assertFalse",
                                args: [
                                    "loop should be false on the video component.",
                                    "{videoPerformer}.source.model.loop"
                                ]
                            },
                            {
                                funcName: "jqUnit.assertFalse",
                                args: [
                                    "loop should be false on the videoPlayer component.",
                                    "{videoPerformer}.sourcePlayer.model.loop"
                                ]
                            },
                            {
                                func: "{videoPerformer}.applier.change",
                                args: ["loop", true]
                            },
                            {
                                funcName: "jqUnit.assertTrue",
                                args: [
                                    "loop should be true on the parent.",
                                    "{videoPerformer}.model.loop"
                                ]
                            },
                            {
                                funcName: "jqUnit.assertTrue",
                                args: [
                                    "loop should be true on the video component.",
                                    "{videoPerformer}.source.model.loop"
                                ]
                            },
                            {
                                funcName: "jqUnit.assertTrue",
                                args: [
                                    "loop should be true on the videoPlayer component.",
                                    "{videoPerformer}.sourcePlayer.model.loop"
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    fluid.test.runTests("aconite.test.videoPerformer.testEnvironment");
})();
