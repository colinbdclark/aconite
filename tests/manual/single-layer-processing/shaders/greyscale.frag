precision lowp float;

uniform sampler2D layerSampler;
uniform vec2 textureSize;

float luma (vec4 fragment) {
    return (fragment.r * 0.2126) + (fragment.g * 0.7152) + (fragment.b * 0.0722);
}

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 layerFragment = texture2D(layerSampler, coords);

    float luma = luma(layerFragment);
    gl_FragColor = vec4(luma, luma, luma, 1.0);
}
