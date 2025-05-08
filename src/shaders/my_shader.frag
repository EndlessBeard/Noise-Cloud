// This file contains the GLSL fragment shader code for the main noise visualization.
// It outputs a basic visual, such as a solid color or gradient.

precision mediump float;

// Uniforms passed from JavaScript
uniform vec2 u_resolution;  // Canvas resolution (width, height)
uniform float u_time;       // Time in seconds for animation

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // Creating a simple animated gradient
    vec3 color1 = vec3(0.2, 0.4, 0.8);  // Blue-ish
    vec3 color2 = vec3(0.8, 0.2, 0.6);  // Pink-ish
    
    // Oscillate using sin function and time
    float mix_value = sin(u_time * 0.5) * 0.5 + 0.5;
    
    // Mix colors based on both position and time
    vec3 color = mix(color1, color2, mix_value * uv.x + (1.0 - mix_value) * uv.y);
    
    // Set the output color
    gl_FragColor = vec4(color, 1.0);
}