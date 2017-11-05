/*
 * Aconite Animation
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.animator", {
        gradeNames: "fluid.viewComponent",

        // TODO: Replace this with model relay.
        uniformModelMap: {},  // Uniform name : model path

        stageBackgroundColor: {
            r: 0.0,
            g: 0.0,
            b: 0.0,
            a: 1.0
        },

        drawableChildOptions: {
            listeners: {
                "{videoCompositor}.events.onDrawFrame": "{that}.draw()"
            }
        },

        playableChildOptions: {
            listeners: {
                "{videoCompositor}.events.onPlay": "{that}.play()"
            }
        },

        distributeOptions: [
            {
                source: "{that}.options.drawableChildOptions",
                target: "{that > aconite.drawable}.options"
            },
            {
                source: "{that}.options.playableChildOptions",
                target: "{that > aconite.playable}.options"
            }
        ],

        invokers: {
            drawFrame: {
                funcName: "aconite.animator.drawFrame",
                args: [
                    "{that}",
                    "{glRenderer}",
                    "{that}.options.uniformModelMap",
                    "{that}.events.onDrawFrame.fire"
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
            onDrawFrame: null,
            onPause: null
        },

        listeners: {
            "onReady.setStageColor": {
                funcName: "aconite.animator.setStageColor",
                args: ["{glRenderer}.gl", "{that}.options.stageBackgroundColor"]
            },

            "onReady.makeStageVertex": {
                priority: "after:setStageColor",
                funcName: "aconite.animator.makeStageVertex",
                args: [
                    "{glRenderer}.gl",
                    "{glRenderer}.shaderProgram.aVertexPosition"
                ]
            },

            "onPlay.startClock": {
                func: "{that}.clock.start",
                priority: "last"
            },

            "onPause.startClock": {
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

    aconite.animator.drawFrame = function (that, glRenderer, uniformModelMap, onDrawFrame) {
        var gl = glRenderer.gl;

        aconite.animator.setFrameRateUniforms(that.model, glRenderer, uniformModelMap);
        onDrawFrame(that, glRenderer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };


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


    fluid.defaults("aconite.drawable", {
        gradeNames: "fluid.component",

        invokers: {
            draw: "fluid.mustBeOverridden"
        }
    });

    fluid.defaults("aconite.playable", {
        gradeNames: "fluid.component",

        invokers: {
            play: "fluid.mustBeOverridden",
            pause: "fluid.mustBeOverridden"
        },

        events: {
            onReady: null
        }
    });


    fluid.defaults("aconite.immediatelyPlayable", {
        gradeNames: "aconite.playable",

        listeners: {
            "onCreate.fireOnReady": "{that}.events.onReady.fire({that})"
        }
    });
})();
