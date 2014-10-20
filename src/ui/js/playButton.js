(function () {
    "use strict";

    fluid.registerNamespace("aconite.ui");

    /***************
     * Play Button *
     ***************/

    fluid.defaults("aconite.ui.playButtonOverlay", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],

        invokers: {
            play: {
                funcName: "aconite.ui.playButtonOverlay.play",
                args: ["{that}.container", "{that}.events.onPlay", "{that}.options.selectors.fullScreen"]
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

    aconite.ui.playButtonOverlay.play = function (playButton, onPlay, fullScreenerSel) {
        var el = document.querySelector(fullScreenerSel),
            rfs = el.webkitRequestFullScreen ? "webkitRequestFullScreen" :
                el.mozRequestFullScreen ? "mozRequestFullScreen" : "requestFullScreen";

        el[rfs]();
        onPlay.fire();
    };

}());
