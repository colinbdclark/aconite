(function () {
    "use strict";

    fluid.defaults("aconite.test.nativeOnlineVideoPlayerFragmentNoLoopingTest", {
        gradeNames: "aconite.test.videoPlayerTest",

        model: {
            loop: false,
            inTime: 0.2,
            outTime: 0.5
        }
    });
})();
