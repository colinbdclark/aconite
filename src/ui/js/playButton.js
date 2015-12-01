/*
 * Aconite UI Play Button
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite, jQuery*/

(function () {
    "use strict";

    /***************
     * Play Button *
     ***************/

    fluid.defaults("aconite.ui.playButtonOverlay", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],

        playDelay: 10,

        invokers: {
            play: {
                funcName: "aconite.ui.playButtonOverlay.play",
                args: [
                    "{that}.container",
                    "{that}.events.onActivated.fire",
                    "{that}.events.onPlay.fire",
                    "{that}.options.selectors.fullScreen",
                    "{that}.options.playDelay"
                ]
            }
        },

        events: {
            onActivated: null,
            onPlay: null,
            onFullScreenChange: null
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
                },

                {
                    funcName: "aconite.ui.playButtonOverlay.bindFullScreenListener",
                    args: [
                        "{that}.options.selectors.fullScreen",
                        "{that}.events.onFullScreenChange.fire"
                    ]
                }
            ],

            onPlay: {
                "this": "{that}.container",
                method: "hide"
            },

            onFullScreenChange: {
                funcName: "aconite.ui.playButtonOverlay.toggleCursor",
                args: ["{that}.options.selectors.fullScreen", "{that}.options.styles"]
            }
        },

        selectors: {
            fullScreen: "body"
        },

        styles: {
            fullScreen: "aconite-full-screen"
        }
    });

    aconite.ui.playButtonOverlay.fullScreenEventNames = [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "msfullscreenchange"
    ];

    aconite.ui.playButtonOverlay.bindFullScreenListener = function (fullScreenSel, onFullScreenChange) {
        var el = document.querySelector(fullScreenSel);

        fluid.each(aconite.ui.playButtonOverlay.fullScreenEventNames, function (eventName) {
            el.addEventListener(eventName, onFullScreenChange);
        });
    };

    aconite.ui.playButtonOverlay.play = function (playButton, onActivated, onPlay, fullScreenSel, playDelay) {
        var jEl = jQuery(fullScreenSel),
            el = jEl[0],
            rfs = el.webkitRequestFullScreen ? "webkitRequestFullScreen" :
                el.mozRequestFullScreen ? "mozRequestFullScreen" : "requestFullScreen";

        onActivated();

        el[rfs]();

        setTimeout(onPlay, playDelay * 1000);
    };

    aconite.ui.playButtonOverlay.toggleCursor = function (fullScreenSel, styles) {
        var el = jQuery(fullScreenSel);
        el.toggleClass(styles.fullScreen);
    };

}());
