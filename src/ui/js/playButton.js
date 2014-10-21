(function () {
    "use strict";

    fluid.registerNamespace("aconite.ui");

    /***************
     * Play Button *
     ***************/

    fluid.defaults("aconite.ui.playButtonOverlay", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],

        playDelay: 6000,

        invokers: {
            play: {
                funcName: "aconite.ui.playButtonOverlay.play",
                args: [
                    "{that}.container",
                    "{that}.events.onPlay",
                    "{that}.options.selectors.fullScreen",
                    "{that}.options.playDelay"
                ]
            }
        },

        events: {
            onPlay: null
        },

        listeners: {
            onCreate: [
                {
                    "this": "{that}.container",
                    method: "css",
                    args: ["display", "inline"]
                },
                {
                    "this": "{that}.container",
                    method: "click",
                    args: ["{that}.play"]
                }
            ],

            onPlay: {
                "this": "{that}.container",
                method: "hide"
            }
        },

        selectors: {
            fullScreen: "body"
        }
    });

    aconite.ui.playButtonOverlay.play = function (playButton, onPlay, fullScreenerSel, playDelay) {
        var el = $(fullScreenerSel)[0],
            rfs = el.webkitRequestFullScreen ? "webkitRequestFullScreen" :
                el.mozRequestFullScreen ? "mozRequestFullScreen" : "requestFullScreen";

        el[rfs]();

        setTimeout(onPlay.fire, playDelay);
    };

}());
