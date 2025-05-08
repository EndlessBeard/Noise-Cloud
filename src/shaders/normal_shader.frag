// This file contains the GLSL fragment shader code for post-processing, specifically for calculating normals based on the output of the main noise shader.

precision mediump float;

// Input from the main noise shader
uniform sampler2D u_texture;
uniform vec2 u_resolution;

// Function to calculate the normal at a given pixel
vec3 calculateNormal(vec2 uv) {
    float dx = 1.0 / u_resolution.x;
    float dy = 1.0 / u_resolution.y;

    // Sample neighboring pixels
    float left = texture2D(u_texture, uv + vec2(-dx, 0.0)).r;
    float right = texture2D(u_texture, uv + vec2(dx, 0.0)).r;
    float top = texture2D(u_texture, uv + vec2(0.0, dy)).r;
    float bottom = texture2D(u_texture, uv + vec2(0.0, -dy)).r;

    // Calculate the normal using central difference
    vec3 normal = vec3(left - right, bottom - top, 0.1);
    return normalize(normal);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 normal = calculateNormal(uv);

    // Output the normal as color (for visualization)
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0); // Normalize to [0, 1] range
}