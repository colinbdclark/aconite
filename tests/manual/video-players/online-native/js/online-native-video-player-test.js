/*global fluid*/

(function () {
    "use strict";

    fluid.defaults("aconite.test.nativeOnlineVideoPlayerTest", {
        gradeNames: "aconite.test.videoPlayerTest",

        components: {
            player: {
                type: "aconite.videoPlayer.nativeElement"
            }
        }
    });

}());
