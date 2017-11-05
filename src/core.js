/*
 * Aconite Core
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2013-2015, Colin Clark
 * Distributed under the MIT license.
 */

/*global fluid, aconite, Float32Array*/

(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    aconite.setupWebGL = function (canvas) {
        function signalError(msg) {
            var str = "\nError: " + msg;
            throw new Error(str);
        }

        canvas.addEventListener("webglcontextcreationerror", function (e) {
            signalError(e.statusMessage);
        }, false);

        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        if (!gl) {
            if (!window.WebGLRenderingContext) {
                signalError("");
            }
        }

        return gl;
    };

    aconite.textToShader = function (gl, text, type) {
        var shader;

        if (type === "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type === "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            throw new Error("Unrecognised shader type: " + type);
        }

        gl.shaderSource(shader, text);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            fluid.log(fluid.logLevel.FAIL, "Error compiling " + type + " shader: " + gl.getShaderInfoLog(shader));
        }

        return shader;
    };

    aconite.loadShaders = function (gl, shaderSpecs, success, error) {
        var deferreds = [],
            shaders = {};

        var handleError = function (error, callback) {
            if (callback) {
                callback(error.message);
            } else {
                throw error;
            }
        };

        fluid.each(shaderSpecs, function (file, key) {
            deferreds.push(jQuery.ajax({
                type: "GET",
                dataType: "text",
                url: file,
                success: function (data) {
                    try {
                        shaders[key] = aconite.textToShader(gl, data, key);
                    } catch (e) {
                        handleError(e, error);
                    }
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(new Error(textStatus + " " + errorThrown), error);
                }
            }));
        });

        jQuery.when.apply(jQuery, deferreds).then(function () {
            success(shaders);
        });
    };

    aconite.getUniformLocation = function (gl, shaderProgram, variable) {
        var location = gl.getUniformLocation(shaderProgram, variable);
        shaderProgram[variable] = location;
    };

    aconite.initUniform = function (gl, shaderProgram, name, uniformSpec) {
        if (uniformSpec.struct) {
            var struct = fluid.getGlobalValue(uniformSpec.struct);
            for (var i = 0; i < uniformSpec.count; ++i) {
                for (var key in struct) {
                    var fullvar = name + "[" + i + "]." + key;
                    aconite.getUniformLocation(gl, shaderProgram, fullvar);
                }
            }
        } else {
            aconite.getUniformLocation(gl, shaderProgram, name);
        }
    };

    aconite.initAttribute = function (gl, shaderProgram, name, attributeSpec) {
        var pos = gl.getAttribLocation(shaderProgram, name);
        if (attributeSpec.type === "vertexAttribArray") {
            gl.enableVertexAttribArray(pos);
        } else {
            throw new Error("Unrecognised attribute type " + attributeSpec.type);
        }
        shaderProgram[name] = pos;
    };

    // TODO: Only log in case of errors, or use fluid.log for more fine-grained control of logging.
    aconite.initShaders = function (gl, variables, shaders) {
        var shaderProgram = gl.createProgram();
        fluid.log(fluid.logLevel.INFO, "Create program status code: " +  gl.getError());
        gl.attachShader(shaderProgram, shaders.vertex);
        fluid.log(fluid.logLevel.INFO, "Attach vertex shader status code: " +  gl.getError());
        gl.attachShader(shaderProgram, shaders.fragment);
        fluid.log(fluid.logLevel.INFO, "Attach fragment shader status code " +  gl.getError());
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Could not link shaders: " + gl.getProgramInfoLog(shaderProgram) +
                " code " + gl.getError());
        }

        gl.useProgram(shaderProgram);

        fluid.each(variables.uniforms, function (uniformSpec, name) {
            aconite.initUniform(gl, shaderProgram, name, uniformSpec);
            fluid.log(fluid.logLevel.INFO, "Init uniform '" + name + "' status code: " +  gl.getError());
        });

        fluid.each(variables.attributes, function (attrSpec, name) {
            aconite.initAttribute(gl, shaderProgram, name, attrSpec);
            fluid.log(fluid.logLevel.INFO, "Init attribute '" + name + "' status code: " +  gl.getError());
        });

        return shaderProgram;
    };

    // TODO: This function produces garbage each time it is called.
    aconite.setUniform = function (gl, shaderProgram, name, type, values, transpose) {
        values = fluid.makeArray(values);

        var setter = "uniform" + type,
            uniform = shaderProgram[name],
            args = fluid.copy(values);

        if (transpose !== undefined) {
            args.unshift(transpose);
        }

        args.unshift(uniform);
        gl[setter].apply(gl, args);
    };

    // TODO: This API makes it very difficult to specify one dimensional vectors
    // because it can't currently infer unidimensionality as it does for scalars types.
    aconite.setUniforms = function (gl, shaderProgram, uniforms) {
        fluid.each(uniforms, function (valueSpec, key) {
            aconite.setUniform(gl, shaderProgram, key, valueSpec.type, valueSpec.values,
                valueSpec.transpose);
        });
    };

    aconite.makeSquareVertexBuffer = function (gl, vertexPosition) {
        var info = {
            vertices: new Float32Array([
                -1, 1,   1,  1,   1, -1,  // Triangle 1
                -1, 1,   1, -1,  -1, -1   // Triangle 2
            ]),
            size: 2
        };

        info.count = info.vertices.length / info.vertexSize;
        info.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, info.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, info.vertices, gl.STATIC_DRAW);

        if (vertexPosition !== undefined) {
            gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
        }

        return info;
    };

})();
