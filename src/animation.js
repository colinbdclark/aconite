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
            },

            tick: {
                funcName: "aconite.animationClock.tick",
                args: ["{that}.model", "{that}.events.onNextFrame.fire"]
            },

            scheduleNextTick: {
                func: "{that}.raf",
                args: ["{that}.events.onTick.fire"]
            }
        },

        events: {
            onTick: null,
            onNextFrame: null
        },

        listeners: {
            onTick: [
                "{that}.tick()"
            ],

            onNextFrame: [
                "{that}.scheduleNextTick()"
            ]
        },

        modelListeners: {
            "active": "{that}.events.onTick.fire()"
        }
    });

    aconite.animationClock.tick = function (m, onNextFrame) {
        if (m.active) {
            onNextFrame();
        }
    };


    fluid.defaults("aconite.animationClock.frameCounter", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],

        numFrames: 72000, // 20 minutes at 60 fps

        members: {
            frameDurations: {
                expander: {
                    funcName: "aconite.animationClock.frameCounter.initFrameDurations",
                    args: ["{that}.options.numFrames"]
                }
            }
        },

        model: {
            lastTime: null,
            frameCount: 0
        },

        invokers: {
            recordTime: {
                funcName: "aconite.animationClock.frameCounter.recordTime",
                args: [ "{that}.frameDurations", "{that}.model"]
            },

            maxDuration: {
                funcName: "aconite.animationClock.frameCounter.maxDuration",
                args: ["{that}.frameDurations"]
            },

            avgDuration: {
                funcName: "aconite.animationClock.frameCounter.avgDuration",
                args: ["{that}.model.frameCount", "{that}.frameDurations"]
            }
        },

        listeners: {
            "{animationClock}.events.onTick": "{that}.recordTime()"
        },

        selectors: {
            fpsCounter: ".aconite-fps-counter"
        }
    });

    aconite.animationClock.frameCounter.initFrameDurations = function (numFrames) {
        return new Float32Array(numFrames);
    };

    aconite.animationClock.frameCounter.maxDuration = function (frameDurations) {
        return DSP.max(frameDurations);
    };

    aconite.animationClock.frameCounter.avgDuration = function (frameCount, frameDurations) {
        var sum = 0;
        for (var i = 0; i < frameCount; i++) {
            sum += frameDurations[i];
        }

        return sum / frameCount;
    };

    aconite.animationClock.frameCounter.recordTime = function (frameDurations, m) {
        if (m.lastTime === null) {
            m.lastTime = performance.now();
            return;
        }

        var now = performance.now(),
            dur = now - m.lastTime;

        frameDurations[m.frameCount] = dur;

        m.lastTime = now;
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

    aconite.animator.makeStageVertex = function (gl, vertexPosition, color) {
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


    fluid.defaults("aconite.animator.playable", {
        gradeNames: ["aconite.animator", "autoInit"],

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
        gradeNames: ["aconite.animator", "autoInit"],

        components: {
            frameCounter: {
                type: "aconite.animationClock.frameCounter",
                container: "{that}.options.selectors.fpsCounter"
            }
        },

        selectors: {
            fpsCounter: ".aconite-fps-display"
        }
    });


    // TODO: Generalize this to an arbitrary number of layers.
    fluid.defaults("aconite.videoCompositor", {
        gradeNames: ["aconite.animator", "autoInit"],

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
    aconite.videoCompositor.refreshLayers = function (top, bottom) {
        top.refresh();
        bottom.refresh();
    };


    fluid.defaults("aconite.videoCompositor.glRenderer", {
        gradeNames: ["aconite.glComponent", "autoInit"],

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
            topSampler: {
                type: "i",
                value: 0
            },
            bottomSampler: {
                type: "i",
                value: 1
            },
            textureSize: {
                type: "f",
                value: [
                    "{videoCompositor}.dom.stage.0.width", "{videoCompositor}.dom.stage.0.height"
                ]
            }
        }

    });
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
