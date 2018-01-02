/*
 * Aconite Video Player Tests
 *
 * Copyright 2018, Colin Clark
 * Licensed under the MIT and GPL 3 licenses.
 */

/*global require, aconite*/

var fluid = fluid || require("infusion"),
    jqUnit = jqUnit || require("node-jqunit");

(function () {
    "use strict";

    fluid.defaults("aconite.test.videoPlayer.testEnvironment", {
        gradeNames: "fluid.test.testEnvironment",

        components: {
            inOutTimeVideoPlayer: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    model: {
                        loop: true
                    },
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
                        }
                    }
                }
            },

            outTimeVideoPlayer: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    model: {
                        loop: true
                    },
                    components: {
                        video: {
                            type: "aconite.video",
                            options: {
                                model: {
                                    url: "../videos/lichen-03-720p.mp4",
                                    outTime: 0.2
                                }
                            }
                        }
                    }
                }
            },

            inTimeDurationPlayer: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    model: {
                        loop: true
                    },
                    components: {
                        video: {
                            type: "aconite.video",
                            options: {
                                model: {
                                    url: "../videos/lichen-03-720p.mp4",
                                    inTime: 0.1,
                                    duration: 0.2
                                }
                            }
                        }
                    }
                }
            },

            nonLoopingVideoPlayer: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    model: {
                        loop: false
                    },
                    components: {
                        video: {
                            type: "aconite.video",
                            options: {
                                model: {
                                    url: "../videos/lichen-03-720p.mp4",
                                    inTime: 0.1,
                                    duration: 0.2
                                }
                            }
                        }
                    }
                }
            },

            noTrimPointsNonLoopingVideoPlayer: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    model: {
                        loop: false
                    },
                    components: {
                        video: {
                            type: "aconite.video",
                            options: {
                                model: {
                                    url: "../videos/lichen-03-720p.mp4"
                                }
                            }
                        }
                    }
                }
            },

            noTrimPointsLoopingVideoPlayer: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    model: {
                        loop: true
                    },
                    components: {
                        video: {
                            type: "aconite.video",
                            options: {
                                model: {
                                    url: "../videos/lichen-03-720p.mp4"
                                }
                            }
                        }
                    }
                }
            },

            tester: {
                type: "aconite.test.videoPlayer.tester"
            }
        }
    });

    fluid.defaults("aconite.test.videoPlayer.tester", {
        gradeNames: "fluid.test.testCaseHolder",

        modules: [
            {
                name: "aconite.videoPlayer.nativeElement.canLoopNatively Tests",
                tests: [
                    {
                        name: "Looping video with in and out time",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "aconite.test.videoPlayer.tester.assertCanLoopNatively",
                                args: [
                                    "The video should not be loopable natively.",
                                    false,
                                    "{inOutTimeVideoPlayer}"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Looping video with only an out time",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "aconite.test.videoPlayer.tester.assertCanLoopNatively",
                                args: [
                                    "The video should not be loopable natively.",
                                    false,
                                    "{outTimeVideoPlayer}"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Looping video with an in time and duration",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "aconite.test.videoPlayer.tester.assertCanLoopNatively",
                                args: [
                                    "The video should not be loopable natively.",
                                    false,
                                    "{inTimeDurationPlayer}"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Non-looping video player with an in time and duration",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "aconite.test.videoPlayer.tester.assertCanLoopNatively",
                                args: [
                                    "The video should not be loopable natively.",
                                    false,
                                    "{inTimeDurationPlayer}"
                                ]
                            }
                        ]
                    },
                    {
                        name: "Looping video player with no trim points",
                        expect: 1,
                        sequence: [
                            {
                                funcName: "aconite.test.videoPlayer.tester.assertCanLoopNatively",
                                args: [
                                    "The video should be loopable natively.",
                                    true,
                                    "{noTrimPointsLoopingVideoPlayer}"
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    aconite.test.videoPlayer.tester.assertCanLoopNatively = function (msg, expected, videoPlayer) {
        var actual = aconite.videoPlayer.nativeElement.canLoopNatively(videoPlayer);
        jqUnit.assertEquals(msg, expected, actual);
    };

    fluid.test.runTests("aconite.test.videoPlayer.testEnvironment");
})();
