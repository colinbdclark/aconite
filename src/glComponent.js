(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    fluid.defaults("aconite.glComponent", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],

        shaders: {},                                // User specified.

        uniforms: {                                 // User specified.
            static: {},                             // Static uniforms are set once at startup time.
            dynamic: {}                             // Dynamic uniforms are updated every frame from the model.
        },

        attributes: {},                             // User specified.

        members: {
            gl: "@expand:aconite.glComponent.createGL({that}, {that}.container, {that}.events.onGLReady.fire)"
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
                    args: ["{that}", "{arguments}.0"]
                },
                {
                    funcName: "aconite.glComponent.initializeUniforms",
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

    aconite.glComponent.initializeUniforms = function (gl, shaderProgram, uniforms) {
        aconite.setUniforms(uniforms.static);
        aconite.setUniforms(uniforms.dynamic);
    };
}());
