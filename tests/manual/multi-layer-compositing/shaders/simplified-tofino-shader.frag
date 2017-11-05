precision lowp float;

uniform sampler2D topSampler;
uniform sampler2D bottomSampler;
uniform vec2 textureSize;
uniform float layerBlend;

float luma (vec4 fragment) {
    return (fragment.r * 0.2126) + (fragment.g * 0.7152) + (fragment.b * 0.0722);
}

vec4 scaleColorChannels (vec4 fragment, float scale) {
    return vec4(fragment.r * scale, fragment.g * scale, fragment.b * scale, 1.0);
}

vec4 alpha(vec4 fragment, float alpha) {
    return vec4(fragment.r, fragment.g, fragment.b, alpha);
}

vec4 overlay(vec4 topFrag, vec4 bottomFrag, float blend) {
    return mix(topFrag, bottomFrag, blend);
}

vec4 overlayDifference(vec4 topFrag, vec4 bottomFrag) {
    // Difference compositing in full colour.
    vec3 diff = vec3(topFrag.rgb - bottomFrag.rgb);
    vec3 absDiff = abs(diff);
    vec3 mixed = mix(topFrag.rgb, bottomFrag.rgb, absDiff);

    return vec4(mixed, 1.0);
}

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 topFrag = texture2D(topSampler, coords);
    vec4 bottomFrag = texture2D(bottomSampler, coords);

    vec4 overlaid = overlay(topFrag, bottomFrag, layerBlend);
    vec4 diffOverlaid = overlayDifference(topFrag, bottomFrag);

    gl_FragColor = mix(overlaid, diffOverlaid, 0.13);
}
