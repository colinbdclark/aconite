/*
 * Aconite Animation
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite*/

(function () {
    "use strict";

    fluid.defaults("aconite.animator", {
        gradeNames: "fluid.viewComponent",

        // TODO: Replace this with model relay.
        uniformModelMap: {},  // Uniform name : model path

        // TODO: Factor stage-related behaviour into a separate component.
        stageBackgroundColor: {
            r: 0.0,
            g: 0.0,
            b: 0.0,
            a: 1.0
        },

        invokers: {
            // TODO: Determine whether this invoker is
            // actually used by any clients. If not, remove it.
            updateModel: "fluid.identity()",

            // TODO: Determine whether this invoker is
            // actually used by any clients. If not, remove it.
            render: "fluid.identity()",

            drawFrame: {
                funcName: "aconite.animator.drawFrame",
                args: [
                    "{that}",
                    "{glRenderer}",
                    "{that}.options.uniformModelMap",
                    "{that}.updateModel",
                    "{that}.render"
                ]
            },

            play: "{that}.events.onPlay.fire",

            pause: "{that}.events.onPause.fire"
        },

        components: {
            clock: {
                type: "aconite.animationClock",
                options: {
                    listeners: {
                        onTick: "{animator}.drawFrame"
                    }
                }
            },

            glRenderer: {
                // Users will typically specify or mix in their own glComponent grades.
                type: "aconite.glComponent",
                container: "{animator}.dom.stage",
                options: {
                    events: {
                        afterShaderProgramCompiled: "{animator}.events.onReady"
                    }
                }
            }
        },

        events: {
            onReady: null,
            onPlay: null,
            onPause: null
        },

        listeners: {
            onReady: [
                {
                    funcName: "aconite.animator.setStageColor",
                    args: ["{glRenderer}.gl", "{that}.options.stageBackgroundColor"]

                },

                {
                    funcName: "aconite.animator.makeStageVertex",
                    args: [
                        "{glRenderer}.gl",
                        "{glRenderer}.shaderProgram.aVertexPosition"
                    ]
                }
            ],

            onPlay: {
                func: "{that}.clock.start",
                priority: "last"
            },

            onPause: {
                func: "{that}.clock.stop",
                priority: "first"
            }
        },

        selectors: {
            stage: ".aconite-animator-canvas"
        }
    });

    aconite.animator.setStageColor = function (gl, color) {
        gl.clearColor(color.r, color.g, color.b, color.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    aconite.animator.makeStageVertex = function (gl, vertexPosition) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        aconite.makeSquareVertexBuffer(gl, vertexPosition);
    };

    // This should be bound as a model listener for a component
    // whose entire model consists of mappings to uniforms.
    // perhaps a "shader program" component?
    aconite.animator.setFrameRateUniforms = function (model, glRenderer, uniformModelMap) {
        for (var name in uniformModelMap) {
            var modelPath = uniformModelMap[name],
                valueSpec = glRenderer.options.uniforms[name],
                value = fluid.get(model, modelPath);

            aconite.setUniform(glRenderer.gl, glRenderer.shaderProgram, name, valueSpec.type, value, valueSpec.transpose);
        }
    };

    aconite.animator.drawFrame = function (that, glRenderer, uniformModelMap, onNextFrame, afterNextFrame) {
        var gl = glRenderer.gl;

        onNextFrame(that, glRenderer);
        aconite.animator.setFrameRateUniforms(that.model, glRenderer, uniformModelMap);
        afterNextFrame(that, glRenderer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };


    fluid.defaults("aconite.animator.playable", {
        gradeNames: "aconite.animator",

        components: {
            playButton: {
                options: {
                    selectors: {
                        fullScreen: "{playable}.options.selectors.stage"
                    }
                }
            }
        }
    });

    fluid.defaults("aconite.animator.debugging", {
        gradeNames: "aconite.animator",

        components: {
            frameCounter: {
                type: "aconite.animationClock.frameCounter"
            }
        }
    });

    // TODO: This is a distinctly bad name for this component!
    fluid.defaults("aconite.glRenderer", {
        gradeNames: "aconite.glComponent",

        // TODO: Factor these URLs that they can be
        // correctly relative to the user's project
        shaders: {
            fragment: "shaders/fragmentShader.frag",
            vertex: "shaders/stageVertexShader.vert"
        },

        attributes: {
            aVertexPosition: {
                type: "vertexAttribArray"
            }
        },

        uniforms: {
            textureSize: {
                type: "2f",
                values: [
                    "{animator}.dom.stage.0.width",
                    "{animator}.dom.stage.0.height"
                ]
            }
        }
    });

    fluid.defaults("aconite.glRenderer.singleLayer", {
        gradeNames: "aconite.glRenderer",

        uniforms: {
            layerSampler: {
                type: "1i",
                values: 0
            }
        }
    });

    // TODO: Generalize this to an arbitrary number of layers.
    fluid.defaults("aconite.videoCompositor", {
        gradeNames: "aconite.animator",

        invokers: {
            render: "aconite.videoCompositor.refreshLayers({top}, {bottom})"
        },

        components: {
            glRenderer: {
                type: "aconite.videoCompositor.glRenderer"
            },

            // User-specifiable.
            top: {
                type: "aconite.videoCompositor.topLayer"
            },

            // User-specifiable.
            bottom: {
                type: "aconite.videoCompositor.bottomLayer"
            },

            playButton: {
                createOnEvent: "onVideosReady",
                type: "aconite.ui.playButtonOverlay",
                container: "{videoCompositor}.dom.playButton",
                options: {
                    events: {
                        onActivated: "{videoCompositor}.events.onStart",
                        onPlay: "{videoCompositor}.events.onPlay"
                    }
                }
            }
        },

        events: {
            onStart: null,

            onVideosReady: {
                events: {
                    topReady: "{top}.source.events.onReady",
                    bottomReady: "{bottom}.source.events.onReady"
                },
                args: ["{arguments}.topReady.0", "{arguments}.bottomReady.0"]
            }
        },

        listeners: {
            onPlay: [
                "{top}.play()",
                "{bottom}.play()"
            ]
        },

        selectors: {
            playButton: ".aconite-animator-play"
        }
    });

    // TODO: Naming both for this functions and its callees.
    // TODO: This should simply be an event.
    aconite.videoCompositor.refreshLayers = function (top, bottom) {
        top.refresh();
        bottom.refresh();
    };


    fluid.defaults("aconite.videoCompositor.glRenderer", {
        gradeNames: "aconite.glRenderer",

        uniforms: {
            topSampler: {
                type: "1i",
                values: 0
            },
            bottomSampler: {
                type: "1i",
                values: 1
            }
        }
    });

    fluid.defaults("aconite.videoCompositor.topLayer", {
        gradeNames: "aconite.compositableVideo.layer"
    });

    fluid.defaults("aconite.videoCompositor.bottomLayer", {
        gradeNames: "aconite.compositableVideo.layer",
        bindToTextureUnit: "TEXTURE1"
    });

    fluid.defaults("aconite.videoSequenceCompositor", {
        gradeNames: "aconite.videoCompositor",

        components: {
            // User-specifiable.
            top: {
                type: "aconite.clipSequencer",
                options: {
                    components: {
                        layer: {
                            type: "aconite.videoCompositor.topLayer"
                        }
                    }
                }
            },

            // User-specifiable.
            bottom: {
                type: "aconite.clipSequencer",
                options: {
                    components: {
                        layer: {
                            type: "aconite.videoCompositor.bottomLayer"
                        }
                    }
                }
            }
        },

        events: {
            onVideosReady: {
                events: {
                    topReady: "{top}.preroller.events.onReady",
                    bottomReady: "{bottom}.preroller.events.onReady"
                },
                args: ["{arguments}.topReady.0", "{arguments}.bottomReady.0"]
            }
        }
    });

})();
