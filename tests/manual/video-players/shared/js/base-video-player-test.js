(function () {
    "use strict";

    fluid.defaults("aconite.test.videoPlayerTest", {
        gradeNames: "fluid.viewComponent",

        components: {
            video: {
                type: "aconite.video",
                options: {
                    members: {
                        element: "{videoPlayerTest}.dom.video.0"
                    }
                }
            },

            player: {
                type: "aconite.videoPlayer",
                options: {
                    components: {
                        video: "{video}"
                    }
                }
            }
        },

        listeners: {
            onCreate: [
                "{player}.play()"
            ]
        },

        selectors: {
            video: "video"
        }
    });
})();
