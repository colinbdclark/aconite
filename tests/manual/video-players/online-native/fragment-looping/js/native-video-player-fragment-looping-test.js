(function () {
    "use strict";

    fluid.defaults("aconite.test.nativeOnlineVideoPlayerFragmentLoopingTest", {
        gradeNames: "aconite.test.videoPlayerTest",

        model: {
            loop: true,
            inTime: 0.5,
            outTime: 0.7
        }
    });
})();
