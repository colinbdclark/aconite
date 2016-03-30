precision lowp float;

uniform sampler2D layerSampler;
uniform vec2 textureSize;
uniform float colourMatrix[20];

vec4 applyColourMatrix (vec4 fragment) {
    float r = (colourMatrix[0] * fragment.r) +
        (colourMatrix[1] * fragment.g) +
        (colourMatrix[2] * fragment.b) +
        (colourMatrix[3] * fragment.a) +
        colourMatrix[4];

    float g = (colourMatrix[5] * fragment.r) +
        (colourMatrix[6] * fragment.g) +
        (colourMatrix[7] * fragment.b) +
        (colourMatrix[8] * fragment.a) +
        colourMatrix[9];

    float b = (colourMatrix[10] * fragment.r) +
        (colourMatrix[11] * fragment.g) +
        (colourMatrix[12] * fragment.b) +
        (colourMatrix[13] * fragment.a) +
        colourMatrix[14];

    float a = (colourMatrix[15] * fragment.r) +
        (colourMatrix[16] * fragment.g) +
        (colourMatrix[17] * fragment.b) +
        (colourMatrix[18] * fragment.a) +
        colourMatrix[19];

    return vec4(r, g, b, a);
}

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 layerFragment = texture2D(layerSampler, coords);

    gl_FragColor = applyColourMatrix(layerFragment);
}
