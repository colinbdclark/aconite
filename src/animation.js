(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    fluid.defaults("aconite.animationClock", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],

        model: {
            active: false
        },

        members: {
            raf: window.requestAnimationFrame || window.webkitRequestAnimationFrame
        },

        invokers: {
            start: {
                func: "{that}.applier.change",
                args: ["active", true]
            },

            stop: {
                func: "{that}.applier.change",
                args: ["active", false]
            }
        },

        events: {
            onTick: null,
            onNextFrame: null
        },

        listeners: {
            onTick: {
                funcName: "aconite.animationClock.tick",
                args: ["{that}.model", "{that}.events.onNextFrame.fire"]
            },

            onNextFrame: [
                {
                    func: "{that}.raf",
                    args: ["{that}.events.onTick.fire"],
                    priority: "last"
                }
            ]
        },

        modelListeners: {
            "active": "{that}.events.onTick.fire"
        }
    });

    aconite.animationClock.tick = function (m, onNextFrame) {
        if (m.active) {
            onNextFrame();
        }
    };


    fluid.defaults("aconite.animationClock.frameCounter", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],

        refreshRate: 5,

        model: {
            lastTime: 0,
            sum: 0,
            frameCount: 0
        },

        invokers: {
            refreshView: "aconite.animationClock.frameCounter.calcFPS({that}.dom.fpsCounter, {that}.model)"
        },

        listeners: {
            "{animationClock}.events.onTick": {
                funcName: "aconite.animationClock.frameCounter.calcFPS",
                args: ["{that}.dom.fpsCounter", "{that}.options.refreshRate", "{that}.model"],
                priority: "first"
            }
        },

        selectors: {
            fpsCounter: ".aconite-fps-counter"
        }
    });

    aconite.animationClock.frameCounter.calcFPS = function (fpsCounter, refreshRate, m) {
        var now = performance.now(),
            rate = 1000 / (now - m.lastTime);

        m.lastTime = now;
        m.sum += rate;

        if (m.frameCount >= refreshRate) {
            fpsCounter.text(Math.round(m.sum / refreshRate));
            m.frameCount = m.sum = 0;
        }

        m.frameCount++;
    };


    fluid.defaults("aconite.animator", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],

        uniformModelMap: {},  // Uniform name : model path

        stageBackgroundColor: {
            r: 0.0,
            g: 0.0,
            b: 0.0,
            a: 1.0
        },

        invokers: {
            updateModel: "fluid.identity()",

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
                        onNextFrame: "{animator}.drawFrame"
                    }
                }
            },

            glRenderer: {
                // Users will typically specify or mix in their own glComponent grades.
                type: "aconite.glComponent",
                container: "{animator}.dom.stage",
                options: {
                    listeners: {
                        afterShaderProgramCompiled: [
                            {
                                funcName: "aconite.animator.makeStageVertex",
                                args: [
                                    "{that}.gl",
                                    "{that}.shaderProgram.aVertexPosition",
                                    "{animator}.options.stageBackgroundColor"
                                ]
                            }
                        ]
                    }
                }
            }
        },

        events: {
            onPlay: null,
            onPause: null
        },

        listeners: {
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


    aconite.animator.makeStageVertex = function (gl, vertexPosition, color) {
        // Initialize to black
        gl.clearColor(color.r, color.g, color.b, color.a);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        aconite.makeSquareVertexBuffer(gl, vertexPosition);
    };

    aconite.animator.setFrameRateUniforms = function (model, glRenderer, uniformModelMap) {
        for (var name in uniformModelMap) {
            var modelPath = uniformModelMap[name],
                valueSpec = glRenderer.options.uniforms[name],
                value = fluid.get(model, modelPath);

            aconite.setUniform(glRenderer.gl, glRenderer.shaderProgram, name, valueSpec.type, value);
        }
    };

    aconite.animator.drawFrame = function (that, glRenderer, uniformModelMap, onNextFrame, afterNextFrame) {
        var gl = glRenderer.gl;

        onNextFrame(that, glRenderer);
        aconite.animator.setFrameRateUniforms(that.model, glRenderer, uniformModelMap);
        afterNextFrame(that, glRenderer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };


    // TODO: Generalize this to an arbitrary number of layers.
    fluid.defaults("aconite.videoCompositor", {
        gradeNames: ["aconite.animator", "autoInit"],

        invokers: {
            render: "aconite.videoCompositor.refreshLayers({top}, {bottom})"
        },

        components: {
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
                    listeners: {
                        onPlay: [
                            "{videoCompositor}.play()"
                        ]
                    }
                }
            }
        },

        events: {
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
    aconite.videoCompositor.refreshLayers = function (top, bottom) {
        top.refresh();
        bottom.refresh();
    };

    fluid.defaults("aconite.videoCompositor.topLayer", {
        gradeNames: ["aconite.compositableVideo.layer", "autoInit"]
    });

    fluid.defaults("aconite.videoCompositor.bottomLayer", {
        gradeNames: ["aconite.compositableVideo.layer", "autoInit"],
        bindToTextureUnit: "TEXTURE1"
    });

    fluid.defaults("aconite.videoSequenceCompositor", {
        gradeNames: ["aconite.videoCompositor", "autoInit"],

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
                    topReady: "{top}.preRoller.events.onReady",
                    bottomReady: "{bottom}.preRoller.events.onReady"
                },
                args: ["{arguments}.topReady.0", "{arguments}.bottomReady.0"]
            }
        }
    });

}());
