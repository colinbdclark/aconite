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
            },

            playButton: {
                type: "aconite.ui.playButtonOverlay",
                container: ".aconite-animator-play",
                options: {
                    listeners: {
                        onPlay: "{videoPlayerTest}.play()"
                    }
                }
            }
        },

        selectors: {
            video: "video"
        }
    });
})();
