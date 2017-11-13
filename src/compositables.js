/*
 * Aconite Compositables
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    fluid.defaults("aconite.texture", {
        gradeNames: "fluid.component",

        members: {
            gl: null,
            texture: null
        },

        events: {
            onTextureReady: null
        },

        listeners: {
            onCreate: {
                funcName: "aconite.texture.create",
                args: ["{that}"]
            }
        },

        parameters: {
            "TEXTURE_WRAP_S": "CLAMP_TO_EDGE",
            "TEXTURE_WRAP_T": "CLAMP_TO_EDGE",
            "TEXTURE_MIN_FILTER": "NEAREST",
            "TEXTURE_MAG_FILTER": "NEAREST"
        },

        bindToTextureUnit: "TEXTURE0"
    });

    aconite.texture.create = function (that) {
        var gl = that.gl,
            texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        fluid.each(that.options.parameters, function (value, key) {
            gl.texParameteri(gl.TEXTURE_2D, gl[key], gl[value]);
        });

        gl.bindTexture(gl.TEXTURE_2D, null);

        that.texture = texture;
        that.events.onTextureReady.fire(texture);

        return texture;
    };


    fluid.defaults("aconite.compositable", {
        gradeNames: [
            "aconite.drawable",
            "aconite.texture"
        ],

        components: {
            source: {
                type: "fluid.mustBeOverridden"
            }
        },

        invokers: {
            draw: {
                funcName: "aconite.compositable.draw",
                args: [
                    "{that}.gl",
                    "{that}.source",
                    "{that}.texture",
                    "{that}.options.bindToTextureUnit"
                ]
            }
        },

        events: {
            onReady: "{source}.events.onReady"
        }
    });

    aconite.compositable.draw = function (gl, source, texture, textureUnit) {
        if (!source.isReady()) {
            return;
        }

        gl.activeTexture(gl[textureUnit]);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source.element);
    };

    fluid.defaults("aconite.compositableVideo", {
        gradeNames: [
            "fluid.modelComponent",
            "aconite.playable",
            "aconite.compositable"
        ],

        members: {
            gl: "{glRenderer}.gl"
        },

        model: {
            loop: false
        },

        invokers: {
            play: "{that}.sourcePlayer.play()",
            pause: "{that}.sourcePlayer.pause()"
        },

        components: {
            source: {
                type: "aconite.video",
                options: {
                    modelRelay: {
                        source: "{compositableVideo}.model",
                        target: "{that}.model",
                        backward: {
                            excludeSource: "init"
                        },
                        singleTransform: {
                            type: "fluid.transforms.identity"
                        },
                    },
                    model: "{compositableVideo}.model",
                    events: {
                        onReady: "{compositableVideo}.events.onReady"
                    }
                }
            },

            sourcePlayer: {
                type: "aconite.videoPlayer.nativeElement",
                options: {
                    modelRelay: {
                        source: "{compositableVideo}.model",
                        target: "{that}.model",
                        backward: {
                            excludeSource: "init"
                        },
                        singleTransform: {
                            type: "fluid.transforms.identity"
                        }
                    },
                    components: {
                        video: "{compositableVideo}.source"
                    }
                }
            }
        },

        events: {
            onReady: null
        }
    });
})();
