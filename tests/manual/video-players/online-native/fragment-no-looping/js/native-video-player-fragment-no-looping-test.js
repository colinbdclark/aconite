(function () {
    "use strict";

    fluid.defaults("aconite.test.nativeOnlineVideoPlayerFragmentNoLoopingTest", {
        gradeNames: "aconite.test.videoPlayerTest",

        model: {
            loop: false,
            inTime: 2,
            outTime: 5
        }
    });
})();
