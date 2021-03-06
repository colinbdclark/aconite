precision highp float;

uniform sampler2D topSampler;
uniform sampler2D bottomSampler;
uniform vec2 textureSize;

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 topFrag = texture2D(topSampler, coords);
    vec4 bottomFrag = texture2D(bottomSampler, coords);

    gl_FragColor = topFrag;
}
