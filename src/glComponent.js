/*
 * Aconite WebGL Component
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    fluid.defaults("aconite.glComponent", {
        gradeNames: "fluid.viewComponent",

        shaders: {},                                // User specified.
        uniforms: {},                               // User specified.
        attributes: {},                             // User specified.

        members: {
            gl: {
                expander: {
                    funcName: "aconite.glComponent.createGL",
                    args: ["{that}", "{that}.container", "{that}.events.onGLReady.fire"]
                }
            },

            shaderProgram: null // TODO: Currently assigned by that-bashing
                                // during onCreate. Fix this.
        },

        listeners: {
            onCreate: [
                {
                    funcName: "aconite.loadShaders",
                    args: [
                        "{that}.gl",
                        "{that}.options.shaders",
                        "{that}.events.afterShadersLoaded.fire",
                        "{that}.events.onError.fire"
                    ]
                }
            ],

            afterShadersLoaded: [
                {
                    funcName: "aconite.glComponent.setupShaders",
                    args: [
                        "{that}",
                        "{arguments}.0",
                        "{that}.options.attributes",
                        "{that}.options.uniforms"
                    ]
                },
                {
                    funcName: "aconite.setUniforms",
                    args: ["{that}.gl", "{that}.shaderProgram", "{that}.options.uniforms"]
                }
            ]
        },

        events: {
            onGLReady: null,
            afterShadersLoaded: null,
            afterShaderProgramCompiled: null,
            onError: null
        }
    });

    aconite.glComponent.createGL = function (that, container, onGLReady) {
        var gl = aconite.setupWebGL(container[0]);
        onGLReady(gl);

        return gl;
    };

    aconite.glComponent.setupShaders = function (that, shaders, attributes, uniforms) {
        var shaderVariables = {
            attributes: attributes,
            uniforms: uniforms
        };

        that.shaderProgram = aconite.initShaders(that.gl, shaderVariables, shaders);
        that.events.afterShaderProgramCompiled.fire(that.shaderProgram);
    };

})();
