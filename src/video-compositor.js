/*
 * Aconite Video Compositors
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.videoCompositor", {
        gradeNames: "aconite.animator",

        components: {
            glRenderer: {
                type: "fluid.mustBeOverridden"
            }
        },

        events: {
            onStart: null,

            // TODO: We want to be able to boil this from an
            // arbitrary number of playable children's
            // onReady events.
            onVideosReady: null
        }
    });


    fluid.defaults("aconite.videoCompositor.autoPlay", {
        gradeNames: "aconite.videoCompositor",

        listeners: {
            "onVideosReady.play": {
                func: "{that}.events.onPlay.fire"
            }
        }
    });


    fluid.defaults("aconite.videoCompositor.withPlayButton", {
        gradeNames: "aconite.videoCompositor",

        components: {
            playButton: {
                createOnEvent: "onVideosReady",
                type: "aconite.ui.playButtonOverlay",
                container: "{withPlayButton}.dom.playButton",
                options: {
                    events: {
                        onActivated: "{withPlayButton}.events.onStart",
                        onPlay: "{withPlayButton}.events.onPlay"
                    },

                    selectors: {
                        fullScreen: "{withPlayButton}.options.selectors.stage"
                    }
                }
            }
        },

        selectors: {
            playButton: ".aconite-animator-play"
        }
    });

    // TODO: This grade can likely be removed when
    // we figure out how to handle the boiling of an arbitrary
    // number of aconite.playables' onReady events.
    fluid.defaults("aconite.dualLayerVideoCompositor", {
        gradeNames: "aconite.videoCompositor",

        components: {
            // User-specifiable.
            top: {
                type: "aconite.dualLayerVideoCompositor.topLayer"
            },

            // User-specifiable.
            bottom: {
                type: "aconite.dualLayerVideoCompositor.bottomLayer"
            }
        },

        events: {
            onVideosReady: {
                events: {
                    topReady: "{top}.events.onReady",
                    bottomReady: "{bottom}.events.onReady"
                },
                args: [
                    "{arguments}.topReady.0",
                    "{arguments}.bottomReady.0"
                ]
            }
        }
    });

    fluid.defaults("aconite.dualLayerVideoCompositor.glRenderer", {
        gradeNames: "aconite.glRenderer",

        uniforms: {
            topSampler: {
                type: "1i",
                values: 0
            },

            bottomSampler: {
                type: "1i",
                values: 1
            }
        }
    });

    fluid.defaults("aconite.dualLayerVideoCompositor.topLayer", {
        gradeNames: "aconite.compositableVideo.layer"
    });

    fluid.defaults("aconite.dualLayerVideoCompositor.bottomLayer", {
        gradeNames: "aconite.compositableVideo.layer",
        bindToTextureUnit: "TEXTURE1"
    });

    fluid.defaults("aconite.dualVideoSequenceCompositor", {
        gradeNames: "aconite.dualLayerVideoCompositor",

        components: {
            // User-specifiable.
            top: {
                type: "aconite.clipSequencer",
                options: {
                    components: {
                        layer: {
                            type: "aconite.dualLayerVideoCompositor.topLayer"
                        }
                    }
                }
            },

            // User-specifiable.
            bottom: {
                type: "aconite.clipSequencer",
                options: {
                    components: {
                        layer: {
                            type: "aconite.dualLayerVideoCompositor.bottomLayer"
                        }
                    }
                }
            }
        }
    });
})();
