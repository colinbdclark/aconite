(function () {
    "use strict";

    fluid.defaults("aconite.test.videoPlayerTest", {
        gradeNames: [
            "aconite.videoPerformer",
            "fluid.viewComponent"
        ],

        components: {
            source: {
                options: {
                    members: {
                        element: "{videoPlayerTest}.dom.video.0"
                    }
                }
            }
        },

        listeners: {
            "onReady.play": "{that}.play()"
        },

        selectors: {
            video: "video"
        }
    });
})();
