// This file contains the GLSL fragment shader code for the main noise visualization.
// It outputs a basic visual, such as a solid color or gradient.

precision mediump float;

// Uniforms passed from JavaScript
uniform vec2 u_resolution;  // Canvas resolution (width, height)
uniform float u_time;       // Time in seconds for animation
uniform float u_seed;       // Initial seed value
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_speed_x;
uniform float u_speed_y;
uniform float u_speed_z;
uniform float u_freq_scale_x;
uniform float u_freq_scale_y;
uniform float u_freq_scale_z;

// Hash function without permutation tables
vec3 hash3(float n) {
    return fract(sin(vec3(n, n+1.0, n+2.0)) * 43758.5453123);
}

// Simple 3D simplex-like noise function
// Based on https://www.shadertoy.com/view/XsX3zB
float noise(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - i + (i.x + i.y + i.z) * K2;
    
    // Calculate distances to the 4 corners
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    
    vec3 d1 = d0 - i1 + K2;
    vec3 d2 = d0 - i2 + K1 * 2.0;
    vec3 d3 = d0 - 1.0 + K1 * 3.0;
    
    // Calculate hashed gradient indices
    vec4 h = fract(u_seed + vec4(p.x, p.y, p.z, p.x + p.y + p.z) * 0.5);
    
    h = h * h * 3.0 - 2.0 * h * h * h; // Quintic interpolation
    
    // Calculate gradients
    vec4 grad = h * 2.0 - 1.0;
    
    // Evaluate and interpolate
    float n0 = dot(d0, grad.xyz);
    float n1 = dot(d1, grad.xyz - grad.w);
    float n2 = dot(d2, grad.xyz - 1.0 + grad.w);
    float n3 = dot(d3, grad.xyz - 1.0);
    
    // Mix based on falloff function
    vec4 w = max(0.5 - vec4(dot(d0,d0), dot(d1,d1), dot(d2,d2), dot(d3,d3)), 0.0);
    w = w * w * w * w;
    
    return 1.1 * dot(w, vec4(n0, n1, n2, n3));
}

// Fractal Brownian Motion (FBM) to add multiple layers of noise
float fbm(vec3 p) {
    float sum = 0.0;
    float amp = u_amplitude;
    float freq = u_frequency;
    
    // Add several octaves of noise
    for(int i = 0; i < 5; i++) {
        sum += amp * noise(freq * p);
        amp *= 0.5;
        freq *= 2.0;
    }
    
    return sum;
}

void main() {
    // Normalized pixel coordinates (0.0 to 1.0)
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Simple animated gradient with time
    vec3 color = vec3(
        sin(u_time * 0.3) * 0.5 + 0.5,
        sin(uv.x + u_time * 0.5) * 0.5 + 0.5,
        sin(uv.y + u_time * 0.2) * 0.5 + 0.5
    );
    
    // Output final color
    gl_FragColor = vec4(color, 1.0);
}

