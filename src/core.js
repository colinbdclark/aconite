(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    aconite.setupWebGL = function (canvas, options) {
        function signalError (msg) {
            var str = window.WebGLRenderingContext ? OTHER_PROBLEM : GET_A_WEBGL_BROWSER;
            str += "\nError: " + msg;
            throw new Error(str);
        };

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
            throw new Error("Error compiling " + type + " shader: " + gl.getShaderInfoLog(shader));
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
            deferreds.push($.ajax({
                type: "GET",
                dataType: "text",
                url: file,
                success: function(data) {
                    try {
                        shaders[key] = aconite.textToShader(gl, data, key);
                    } catch (e) {
                        handleError(e, error);
                    }
                },

                error: function(jqXHR, textStatus, errorThrown) {
                    handleError(new Error(textStatus + " " + errorThrown), error);
                }
            }));
        });

        $.when.apply($, deferreds).then(function() {
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
        console.log("code " +  gl.getError());
        gl.attachShader(shaderProgram, shaders.vertex);
        console.log("code " +  gl.getError());
        gl.attachShader(shaderProgram, shaders.fragment);
        console.log("code " +  gl.getError());
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Could not link shaders: " + gl.getProgramInfoLog(shaderProgram) +
                " code " + gl.getError());
        }

        gl.useProgram(shaderProgram);

        fluid.each(variables.uniforms, function (uniformSpec, name) {
            aconite.initUniform(gl, shaderProgram, name, uniformSpec);
            console.log("code " +  gl.getError());
        });

        fluid.each(variables.attributes, function (attrSpec, name) {
            aconite.initAttribute(gl, shaderProgram, name, attrSpec);
            console.log("code " +  gl.getError());
        });

        return shaderProgram;
    };

    // TODO: This function produces garbage each time it is called.
    aconite.setUniform = function (gl, shaderProgram, name, type, values) {
        values = fluid.makeArray(values);

        var setter = "uniform" + values.length + type,
            uniform = shaderProgram[name],
            args = fluid.copy(values);

        args.unshift(uniform);
        gl[setter].apply(gl, args);
    };

    aconite.setUniforms = function (gl, shaderProgram, uniforms) {
        fluid.each(uniforms, function (valueSpec, key) {
            aconite.setUniform(gl, shaderProgram, key, valueSpec.type, valueSpec.value);
        });
    };

    aconite.makeSquareVertexBuffer = function(gl, vertexPosition) {
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

}());
