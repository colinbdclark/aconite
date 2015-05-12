precision highp float;

uniform sampler2D topSampler;
uniform sampler2D bottomSampler;
uniform vec2 textureSize;

float rand(vec2 seed){
    return fract(sin(dot(seed.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 topFrag = texture2D(topSampler, coords);
    vec4 bottomFrag = texture2D(bottomSampler, coords);

    gl_FragColor = topFrag;
}
