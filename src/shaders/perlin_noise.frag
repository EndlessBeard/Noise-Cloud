precision mediump float;

// Constants
const int B = 1024; // Increased from 256 to 1024
const int OCTAVES = 5; // Hardcoded octave count for all noise functions
const int GRADIENT_SAMPLES = 16; // Number of color samples in each gradient

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

// NOISE_MASK Uniforms
uniform float u_mask_frequency;     // Frequency for the mask noise
uniform float u_mask_amplitude;     // Amplitude for the mask noise
uniform float u_mask_gain;          // Gain for the mask noise
uniform float u_warp_intensity;     // Intensity of domain warping
uniform float u_warp_scale;         // Scale of domain warping
uniform float u_cutoff1;            // First cutoff value for mask layers (0-1)
uniform float u_cutoff2;            // Second cutoff value for mask layers (0-1)
uniform float u_softness;           // Softness of transitions between layers (0-1)

// BASE_NOISE Uniforms - Layer 1
uniform bool u_base1_active;        // Whether layer 1 is active
uniform float u_base1_offset_x;     // Position offset X for layer 1
uniform float u_base1_offset_y;     // Position offset Y for layer 1
uniform float u_base1_offset_z;     // Position offset Z for layer 1
uniform float u_base1_freq_offset;  // Frequency offset for layer 1
uniform float u_base1_amp_offset;   // Amplitude offset for layer 1
uniform float u_base1_frequency;    // Frequency for layer 1 noise
uniform float u_base1_amplitude;    // Amplitude for layer 1 noise
uniform float u_base1_gain;         // Gain for layer 1 noise
uniform float u_base1_warp_intensity; // Domain warping intensity for layer 1
uniform float u_base1_warp_scale;   // Domain warping scale for layer 1
uniform int u_base1_warp_type;      // Warping type: 0=Add, 1=Multiply, 2=Exponential, 3=Logarithmic
uniform sampler2D u_base1_gradientTex; // Color gradient for layer 1

// BASE_NOISE Uniforms - Layer 2
uniform bool u_base2_active;        // Whether layer 2 is active
uniform float u_base2_offset_x;     // Position offset X for layer 2
uniform float u_base2_offset_y;     // Position offset Y for layer 2
uniform float u_base2_offset_z;     // Position offset Z for layer 2
uniform float u_base2_freq_offset;  // Frequency offset for layer 2
uniform float u_base2_amp_offset;   // Amplitude offset for layer 2
uniform float u_base2_frequency;    // Frequency for layer 2 noise
uniform float u_base2_amplitude;    // Amplitude for layer 2 noise
uniform float u_base2_gain;         // Gain for layer 2 noise
uniform float u_base2_warp_intensity; // Domain warping intensity for layer 2
uniform float u_base2_warp_scale;   // Domain warping scale for layer 2
uniform int u_base2_warp_type;      // Warping type: 0=Add, 1=Multiply, 2=Exponential, 3=Logarithmic
uniform sampler2D u_base2_gradientTex; // Color gradient for layer 2

// BASE_NOISE Uniforms - Layer 3
uniform bool u_base3_active;        // Whether layer 3 is active
uniform float u_base3_offset_x;     // Position offset X for layer 3
uniform float u_base3_offset_y;     // Position offset Y for layer 3
uniform float u_base3_offset_z;     // Position offset Z for layer 3
uniform float u_base3_freq_offset;  // Frequency offset for layer 3
uniform float u_base3_amp_offset;   // Amplitude offset for layer 3
uniform float u_base3_frequency;    // Frequency for layer 3 noise
uniform float u_base3_amplitude;    // Amplitude for layer 3 noise
uniform float u_base3_gain;         // Gain for layer 3 noise
uniform float u_base3_warp_intensity; // Domain warping intensity for layer 3
uniform float u_base3_warp_scale;   // Domain warping scale for layer 3
uniform int u_base3_warp_type;      // Warping type: 0=Add, 1=Multiply, 2=Exponential, 3=Logarithmic
uniform sampler2D u_base3_gradientTex; // Color gradient for layer 3

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

// Custom fractal noise with variable gain
float customFractalNoise3D(vec3 p, float frequency, float amplitude, float gain, vec3 seed) {
    float sum = 0.0;
    float currentGain = 1.0;
    
    for (int i = 0; i < OCTAVES; i++) {
        sum += noise3D(p * currentGain / frequency, seed) * (amplitude / currentGain);
        currentGain *= gain;
    }
    
    return sum;
}

// Domain warping function - takes a position and returns a warped position
vec3 domainWarp(vec3 p, float intensity, float scale, vec3 seed) {
    // Generate a warping vector using noise
    vec3 warp;
    warp.x = noise3D(p * scale, seed);
    warp.y = noise3D(p * scale + vec3(31.416, 27.183, 6.283), seed);
    warp.z = noise3D(p * scale + vec3(-13.37, 47.62, -1.618), seed);
    
    // Apply the warping with intensity control
    return p + warp * intensity;
}

// Apply domain warping with different types
vec3 applyCustomWarp(vec3 p, int warpType, float intensity, float scale, vec3 seed) {
    // Generate a warping vector using noise
    vec3 warp;
    warp.x = noise3D(p * scale, seed);
    warp.y = noise3D(p * scale + vec3(31.416, 27.183, 6.283), seed);
    warp.z = noise3D(p * scale + vec3(-13.37, 47.62, -1.618), seed);
    
    // Apply warping based on type
    if (warpType == 0) {
        // Add - traditional domain warping
        return p + warp * intensity;
    } 
    else if (warpType == 1) {
        // Multiply - scales the domain based on noise
        return p * (1.0 + warp * intensity);
    }
    else if (warpType == 2) {
        // Exponential - extreme warping effect
        return p * exp(warp * intensity);
    }
    else if (warpType == 3) {
        // Logarithmic - subtle warping effect
        return p + log(1.0 + abs(warp) * intensity);
    }
    
    // Default to Add
    return p + warp * intensity;
}

// Mask noise function - returns noise value for mask calculation with domain warping
float maskNoise(vec3 p, float frequency, float amplitude, float gain, float warpIntensity, float warpScale, vec3 seed) {
    // Apply domain warping to the position
    vec3 warpedPos = domainWarp(p, warpIntensity, warpScale, seed);
    
    // Generate fractal noise with the warped position
    float noiseValue = customFractalNoise3D(warpedPos, frequency, amplitude, gain, seed);
    
    return noiseValue;
}

// Base noise function - returns noise value for a base layer with domain warping and parameters
float baseNoise(
    vec3 p, 
    float frequency, 
    float amplitude,
    float gain,
    float warpIntensity, 
    float warpScale,
    int warpType,
    vec3 seed
) {
    // Apply custom domain warping to the position
    vec3 warpedPos = applyCustomWarp(p, warpType, warpIntensity, warpScale, seed);
    
    // Generate fractal noise with the warped position and custom gain
    return customFractalNoise3D(warpedPos, frequency, amplitude, gain, seed);
}

// Calculate the mask layers based on cutoff values and softness
vec3 calculateMaskLayers(float noiseValue, float cutoff1, float cutoff2, float softness) {
    // Ensure cutoff values are in the right order
    cutoff1 = min(cutoff1, cutoff2);
    cutoff2 = max(cutoff1, cutoff2);
    
    // Calculate softness factor (higher value = more blending)
    float blend = max(0.001, softness) * 0.1;
    
    // Calculate smooth transitions using smoothstep
    float mask1 = 1.0 - smoothstep(cutoff1 - blend, cutoff1 + blend, noiseValue);
    float mask2 = smoothstep(cutoff1 - blend, cutoff1 + blend, noiseValue) * 
                 (1.0 - smoothstep(cutoff2 - blend, cutoff2 + blend, noiseValue));
    float mask3 = smoothstep(cutoff2 - blend, cutoff2 + blend, noiseValue);
    
    // Return mask values as RGB components
    return vec3(mask1, mask2, mask3);
}

// Sample a color from a gradient array
vec3 sampleGradient(sampler2D gradientTex, float t) {
    // Ensure t is in the range [0, 1]
    t = clamp(t, 0.0, 1.0);
    
    // Sample the 1D texture (using a 2D texture with a fixed y coordinate)
    return texture2D(gradientTex, vec2(t, 0.5)).rgb;
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
    
    // Generate mask noise
    float maskNoiseValue = maskNoise(
        p, 
        u_mask_frequency * u_frequency, 
        u_mask_amplitude * u_amplitude, 
        u_mask_gain, 
        u_warp_intensity, 
        u_warp_scale,
        seed
    );
    
    // Map noise value from [-0.5, 0.5] to [0, 1]
    maskNoiseValue = maskNoiseValue + 0.5;
    
    // Calculate mask layers
    vec3 maskLayers = calculateMaskLayers(maskNoiseValue, u_cutoff1, u_cutoff2, u_softness);
    
    // Generate base layer noise values
    vec3 finalColor = vec3(0.0);
    
    // Apply Layer 1 if active
    if (u_base1_active) {
        // Create position with layer-specific offsets
        vec3 p1 = vec3(
            p.x + u_base1_offset_x,
            p.y + u_base1_offset_y,
            p.z + u_base1_offset_z
        );
        
        // Generate base noise with layer-specific parameters
        float noise1 = baseNoise(
            p1,
            u_base1_frequency * u_frequency + u_base1_freq_offset,
            u_base1_amplitude * u_amplitude + u_base1_amp_offset,
            u_base1_gain,
            u_base1_warp_intensity,
            u_base1_warp_scale,
            u_base1_warp_type,
            seed
        );
        
        // Map noise to [0, 1] for gradient sampling
        float t1 = noise1 + 0.5;
        
        // Sample the gradient
        vec3 color1 = sampleGradient(u_base1_gradientTex, t1);
        
        // Apply mask
        finalColor += color1 * maskLayers.r;
    }
    
    // Apply Layer 2 if active
    if (u_base2_active) {
        // Create position with layer-specific offsets
        vec3 p2 = vec3(
            p.x + u_base2_offset_x,
            p.y + u_base2_offset_y,
            p.z + u_base2_offset_z
        );
        
        // Generate base noise with layer-specific parameters
        float noise2 = baseNoise(
            p2,
            u_base2_frequency * u_frequency + u_base2_freq_offset,
            u_base2_amplitude * u_amplitude + u_base2_amp_offset,
            u_base2_gain,
            u_base2_warp_intensity,
            u_base2_warp_scale,
            u_base2_warp_type,
            seed
        );
        
        // Map noise to [0, 1] for gradient sampling
        float t2 = noise2 + 0.5;
        
        // Sample the gradient
        vec3 color2 = sampleGradient(u_base2_gradientTex, t2);
        
        // Apply mask
        finalColor += color2 * maskLayers.g;
    }
    
    // Apply Layer 3 if active
    if (u_base3_active) {
        // Create position with layer-specific offsets
        vec3 p3 = vec3(
            p.x + u_base3_offset_x,
            p.y + u_base3_offset_y,
            p.z + u_base3_offset_z
        );
        
        // Generate base noise with layer-specific parameters
        float noise3 = baseNoise(
            p3,
            u_base3_frequency * u_frequency + u_base3_freq_offset,
            u_base3_amplitude * u_amplitude + u_base3_amp_offset,
            u_base3_gain,
            u_base3_warp_intensity,
            u_base3_warp_scale,
            u_base3_warp_type,
            seed
        );
        
        // Map noise to [0, 1] for gradient sampling
        float t3 = noise3 + 0.5;
        
        // Sample the gradient
        vec3 color3 = sampleGradient(u_base3_gradientTex, t3);
        
        // Apply mask
        finalColor += color3 * maskLayers.b;
    }
    
    // If nothing is active, show the mask layers
    if (!u_base1_active && !u_base2_active && !u_base3_active) {
        finalColor = maskLayers;
    }
    
    // Output final color
    gl_FragColor = vec4(finalColor, 1.0);
}