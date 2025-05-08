precision mediump float;

// Constants
const int B = 1024; // Increased from 256 to 1024
const int OCTAVES = 5; // Hardcoded octave count for all noise functions

// Uniforms from JavaScript
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;         // Seed for the noise
uniform float u_frequency;    // Base frequency
uniform float u_amplitude;    // Base amplitude
uniform float u_speed_x;      // Speed of noise movement in X
uniform float u_speed_y;      // Speed of noise movement in Y
uniform float u_speed_z;      // Speed of noise movement in Z
uniform float u_freq_scale_x; // Frequency scaling for X
uniform float u_freq_scale_y; // Frequency scaling for Y
uniform float u_freq_scale_z; // Frequency scaling for Z

// Hash function to replace the permutation table
// Based on https://www.shadertoy.com/view/4djSRW
float hash(float p) {
    p = fract(p * 0.011);
    p *= p + 7.5;
    p *= p + p;
    return fract(p);
}

// 2D hash function
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// 3D hash function for seeding
vec3 hash3(float n) {
    return fract(sin(vec3(n, n + 1.0, n + 2.0)) * 43758.5453123);
}

// Smoothstep polynomial (quintic curve)
float fade(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Linear interpolation
float lerp(float t, float a, float b) {
    return a + t * (b - a);
}

// Gradient function for 3D noise - without bitwise operators
float grad(float hash, float x, float y, float z) {
    // Use the hash to select one of 12 gradient directions
    float h = mod(hash * 16.0, 16.0);
    
    // Use comparisons instead of bitwise operations
    float u = h < 8.0 ? x : y;
    float v = h < 4.0 ? y : (h == 12.0 || h == 14.0 ? x : z);
    
    // Determine if we should negate u and v
    float bitCheck1 = mod(h, 2.0);
    float bitCheck2 = mod(floor(h / 2.0), 2.0);
    
    return (bitCheck1 < 1.0 ? u : -u) + (bitCheck2 < 1.0 ? v : -v);
}

// 3D Perlin noise function
float noise3D(vec3 p, vec3 seed) {
    // Find unit cube containing the point
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    // Fade curves for x, y, z - apply fade separately to each component
    float u_x = fade(f.x);
    float u_y = fade(f.y);
    float u_z = fade(f.z);
    
    // Hash coordinates of the 8 cube corners
    // We add the seed to each corner for randomization
    float n000 = hash(dot(i, vec3(1.0, 1013.0, 1619.0)) + seed.x);
    float n001 = hash(dot(i + vec3(0.0, 0.0, 1.0), vec3(1.0, 1013.0, 1619.0)) + seed.x);
    float n010 = hash(dot(i + vec3(0.0, 1.0, 0.0), vec3(1.0, 1013.0, 1619.0)) + seed.x);
    float n011 = hash(dot(i + vec3(0.0, 1.0, 1.0), vec3(1.0, 1013.0, 1619.0)) + seed.x);
    float n100 = hash(dot(i + vec3(1.0, 0.0, 0.0), vec3(1.0, 1013.0, 1619.0)) + seed.x);
    float n101 = hash(dot(i + vec3(1.0, 0.0, 1.0), vec3(1.0, 1013.0, 1619.0)) + seed.x);
    float n110 = hash(dot(i + vec3(1.0, 1.0, 0.0), vec3(1.0, 1013.0, 1619.0)) + seed.x);
    float n111 = hash(dot(i + vec3(1.0, 1.0, 1.0), vec3(1.0, 1013.0, 1619.0)) + seed.x);
    
    // Generate gradients from hashed values
    vec3 g000 = normalize(2.0 * hash3(n000) - 1.0);
    vec3 g001 = normalize(2.0 * hash3(n001) - 1.0);
    vec3 g010 = normalize(2.0 * hash3(n010) - 1.0);
    vec3 g011 = normalize(2.0 * hash3(n011) - 1.0);
    vec3 g100 = normalize(2.0 * hash3(n100) - 1.0);
    vec3 g101 = normalize(2.0 * hash3(n101) - 1.0);
    vec3 g110 = normalize(2.0 * hash3(n110) - 1.0);
    vec3 g111 = normalize(2.0 * hash3(n111) - 1.0);
    
    // Calculate dot products
    float dp000 = dot(g000, f);
    float dp001 = dot(g001, f - vec3(0.0, 0.0, 1.0));
    float dp010 = dot(g010, f - vec3(0.0, 1.0, 0.0));
    float dp011 = dot(g011, f - vec3(0.0, 1.0, 1.0));
    float dp100 = dot(g100, f - vec3(1.0, 0.0, 0.0));
    float dp101 = dot(g101, f - vec3(1.0, 0.0, 1.0));
    float dp110 = dot(g110, f - vec3(1.0, 1.0, 0.0));
    float dp111 = dot(g111, f - vec3(1.0, 1.0, 1.0));
    
    // Trilinear interpolation
    float x1 = lerp(u_x, dp000, dp100);
    float x2 = lerp(u_x, dp010, dp110);
    float y1 = lerp(u_y, x1, x2);
    
    float x3 = lerp(u_x, dp001, dp101);
    float x4 = lerp(u_x, dp011, dp111);
    float y2 = lerp(u_y, x3, x4);
    
    float result = lerp(u_z, y1, y2);
    
    // Scale to approximately [-0.5, 0.5] to match original implementation
    return result * 0.5;
}

// Fractal noise function with hardcoded 5 octaves
float fractalNoise3D(vec3 p, float frequency, float amplitude, vec3 seed) {
    float sum = 0.0;
    float gain = 1.0;
    
    for (int i = 0; i < OCTAVES; i++) {
        sum += noise3D(p * gain / frequency, seed) * (amplitude / gain);
        gain *= 2.0;
    }
    
    return sum;
}

void main() {
    // Normalized pixel coordinates (0.0 to 1.0)
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Adjust coordinates to be centered and scaled correctly
    vec2 pos = uv * 2.0 - 1.0;
    pos.x *= u_resolution.x / u_resolution.y;  // Correct for aspect ratio
    
    // Create time-based movement using speed uniforms
    float movementX = u_time * u_speed_x;
    float movementY = u_time * u_speed_y;
    float movementZ = u_time * u_speed_z;
    
    // Create input for our 3D Perlin noise with frequency scaling
    vec3 p = vec3(
        pos.x * u_freq_scale_x + movementX,
        pos.y * u_freq_scale_y + movementY,
        movementZ * u_freq_scale_z
    );
    
    // Generate a seed vector based on the uniform seed
    vec3 seed = hash3(u_seed);
    
    // Generate 3D fractal noise with hardcoded 5 octaves
    float n = fractalNoise3D(p, u_frequency, u_amplitude, seed);
    
    // Map noise value to color (simple grayscale)
    // Adjust range from [-0.5, 0.5] to [0, 1]
    n = n + 0.5;
    
    // Create a cloud-like effect with color gradient
    vec3 skyColor = vec3(0.1, 0.3, 0.6); // Deep blue sky
    vec3 cloudColor = vec3(0.9, 0.9, 1.0); // White-ish clouds
    
    // Apply a threshold for more cloud-like appearance
    float cloudiness = smoothstep(0.4, 0.6, n);
    vec3 color = mix(skyColor, cloudColor, cloudiness);
    
    // Output final color
    gl_FragColor = vec4(color, 1.0);
}