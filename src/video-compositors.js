/*
 * Aconite Video Compositors
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2017, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.dualLayerVideoCompositor", {
        gradeNames: "aconite.compositor",

        components: {
            // User-specifiable.
            top: {
                type: "aconite.dualLayerVideoCompositor.topLayer"
            },

            // User-specifiable.
            bottom: {
                type: "aconite.dualLayerVideoCompositor.bottomLayer"
            },

            glRenderer: {
                type: "aconite.dualLayerVideoCompositor.glRenderer"
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
        gradeNames: "aconite.compositableVideo"
    });

    fluid.defaults("aconite.dualLayerVideoCompositor.bottomLayer", {
        gradeNames: "aconite.compositableVideo",
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
