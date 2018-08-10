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
        gradeNames: "fluid.viewComponent",

        playDelay: 10,

        invokers: {
            play: {
                funcName: "aconite.ui.playButtonOverlay.play",
                args: [
                    "{that}.container",
                    "{that}.events.onActivated.fire",
                    "{that}.events.onPlay.fire",
                    "{that}.options.playDelay"
                ]
            }
        },

        events: {
            onActivated: null,
            onPlay: null
        },

        listeners: {
            "onCreate.showButton": {
                "this": "{that}.container",
                method: "css",
                args: ["display", "inline"]
            },

            "onCreate.bindClick": {
                "this": "{that}.container",
                method: "click",
                args: ["{that}.play"]
            },

            "onPlay.hideButton": {
                "this": "{that}.container",
                method: "hide"
            }
        }
    });

    aconite.ui.playButtonOverlay.play = function (playButton, onActivated, onPlay, fullScreenSel, playDelay) {
        onActivated();
        setTimeout(onPlay, playDelay * 1000);
    };

    aconite.ui.playButtonOverlay.toggleCursor = function (fullScreenSel, styles) {
        var el = jQuery(fullScreenSel);
        el.toggleClass(styles.fullScreen);
    };


    fluid.defaults("aconite.ui.playButtonOverlay.fullScreen", {
        gradeNames: "aconite.ui.playButtonOverlay",

        events: {
            onFullScreenChange: null
        },

        listeners: {
            "onCreate.bindListener": {
                funcName: "aconite.ui.playButtonOverlay.fullScreen.bindListener",
                args: [
                    "{that}.options.selectors.fullScreen",
                    "{that}.events.onFullScreenChange.fire"
                ]
            },

            "onActivated.requestFullScreen": {
                funcName: "aconite.ui.playButtonOverlay.fullScreen.requestFullScreen",
                args: [
                    "{that}.options.selectors.fullScreen"
                ]
            },

            "onFullScreenChange.toggleCursorStyle": {
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

    aconite.ui.playButtonOverlay.fullScreen.eventNames = [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "msfullscreenchange"
    ];

    aconite.ui.playButtonOverlay.fullScreen.bindListener = function (fullScreenSel, onFullScreenChange) {
        var el = document.querySelector(fullScreenSel);

        fluid.each(aconite.ui.playButtonOverlay.fullScreen.eventNames, function (eventName) {
            el.addEventListener(eventName, onFullScreenChange);
        });
    };

    aconite.ui.playButtonOverlay.fullScreen.requestFullScreen = function (fullScreenSel) {
        var jEl = jQuery(fullScreenSel),
            el = jEl[0],
            rfs = el.webkitRequestFullScreen ? "webkitRequestFullScreen" :
            el.mozRequestFullScreen ? "mozRequestFullScreen" : "requestFullScreen";

        el[rfs]();
    };
})();
