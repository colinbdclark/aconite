/*global fluid*/

(function () {
    "use strict";

    fluid.defaults("aconite.test.manualOnlineVideoPlayerTest", {
        gradeNames: "fluid.viewComponent",

        components: {
            video: {
                type: "aconite.video",
                options: {
                    members: {
                        element: "{manualOnlineVideoPlayerTest}.dom.video.0"
                    }
                }
            },

            player: {
                type: "aconite.videoPlayer.manualOnline",
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

}());
