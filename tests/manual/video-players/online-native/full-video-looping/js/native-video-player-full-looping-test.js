(function () {
    "use strict";

    fluid.defaults("aconite.test.nativeOnlineVideoPlayerFullLoopingTest", {
        gradeNames: "aconite.test.videoPlayerTest",

        model: {
            loop: true
        },

        modelListeners: {
            loop: {
                funcName: "console.log",
                args: ["{change}.value"]
            }
        }
    });
})();
