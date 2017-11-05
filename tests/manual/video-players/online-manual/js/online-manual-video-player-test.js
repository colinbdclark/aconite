/*global fluid*/

(function () {
    "use strict";

    fluid.defaults("aconite.test.manualOnlineVideoPlayerTest", {
        gradeNames: "aconite.test.videoPlayerTest",

        components: {
            player: {
                type: "aconite.videoPlayer.manualOnline"
            }
        }
    });
})();
