(function () {
    "use strict";

    fluid.defaults("aconite.test.nativeOnlineVideoPlayerFragmentLoopingTest", {
        gradeNames: "aconite.test.videoPlayerTest",

        model: {
            loop: true,
            inTime: 5,
            outTime: 7
        }
    });
})();
