/**
 * NoiseControls.js - UI controls for noise parameters
 */
import { GUI } from 'lil-gui';
import ColorGradient from '../utils/ColorGradient.js';

export default class NoiseControls {
    constructor(app) {
        this.app = app;
        
        // Initialize color gradients
        this.colorGradients = {
            base1: new ColorGradient([
                { color: '#0000FF', pos: 0.0 },  // Deep blue
                { color: '#00FFFF', pos: 0.5 },  // Cyan
                { color: '#FFFFFF', pos: 1.0 }   // White
            ]),
            base2: new ColorGradient([
                { color: '#006400', pos: 0.0 },  // Dark green
                { color: '#00FF00', pos: 0.5 },  // Bright green
                { color: '#FFFF00', pos: 1.0 }   // Yellow
            ]),
            base3: new ColorGradient([
                { color: '#800000', pos: 0.0 },  // Dark red
                { color: '#FF0000', pos: 0.5 },  // Bright red
                { color: '#FFA500', pos: 1.0 }   // Orange
            ])
        };
        
        // Warp type options
        this.warpTypes = ['Add', 'Multiply', 'Exponential', 'Logarithmic'];
        
        this.params = {
            seed: 12345,
            globalFrequency: 1.0,
            globalAmplitude: 1.0,
            speed: {
                x: 0.1,
                y: 0.1,
                z: 0.05
            },
            frequencyScale: {
                x: 1.0,
                y: 1.0,
                z: 1.0
            },
            // NOISE_MASK parameters
            noiseMask: {
                frequency: 1.0,
                amplitude: 1.0,
                gain: 2.0,
                warpIntensity: 0.5,
                warpScale: 1.0,
                cutoff1: 0.33,
                cutoff2: 0.66,
                softness: 0.5
            },
            // BASE_NOISE parameters 
            baseNoise: {
                base1: {
                    active: true,
                    offset: {
                        x: 0.0,
                        y: 0.0,
                        z: 0.0,
                        frequency: 1.0,
                        amplitude: 1.0
                    },
                    frequency: 1.0,
                    amplitude: 1.0,
                    gain: 2.0,
                    warpIntensity: 0.3,
                    warpScale: 1.0,
                    warpType: 'Add' // 'Add', 'Multiply', 'Exponential', 'Logarithmic'
                },
                base2: {
                    active: true,
                    offset: {
                        x: 1.0,
                        y: 1.0,
                        z: 1.0,
                        frequency: 1.5,
                        amplitude: 0.8
                    },
                    frequency: 1.5,
                    amplitude: 0.8,
                    gain: 2.0,
                    warpIntensity: 0.3,
                    warpScale: 1.0,
                    warpType: 'Add'
                },
                base3: {
                    active: true,
                    offset: {
                        x: 2.0,
                        y: 2.0,
                        z: 2.0,
                        frequency: 2.0,
                        amplitude: 0.6
                    },
                    frequency: 2.0,
                    amplitude: 0.6,
                    gain: 2.0,
                    warpIntensity: 0.3,
                    warpScale: 1.0,
                    warpType: 'Add'
                }
            }
        };
        
        // Create the GUI
        this.gui = new GUI({ title: 'Noise Controls', width: 270 });
        this.gui.domElement.classList.add('noise-controls');
        
        // Initialize the controls
        this.initControls();
    }
    
    /**
     * Initialize the UI controls
     */
    initControls() {
        // Main controls
        this.gui.add(this.params, 'seed', 0, 100000, 1)
            .name('Seed')
            .onChange(() => this.updateUniforms());
        
        this.gui.add(this.params, 'globalFrequency', 0.1, 5, 0.01)
            .name('Global Frequency')
            .onChange(() => this.updateUniforms());
        
        this.gui.add(this.params, 'globalAmplitude', 0.1, 2, 0.01)
            .name('Global Amplitude')
            .onChange(() => this.updateUniforms());
        
        // Speed folder
        const speedFolder = this.gui.addFolder('Speed Controls');
        
        speedFolder.add(this.params.speed, 'x', -0.5, 0.5, 0.01)
            .name('X Speed')
            .onChange(() => this.updateUniforms());
        
        speedFolder.add(this.params.speed, 'y', -0.5, 0.5, 0.01)
            .name('Y Speed')
            .onChange(() => this.updateUniforms());
        
        speedFolder.add(this.params.speed, 'z', -0.5, 0.5, 0.01)
            .name('Z Speed')
            .onChange(() => this.updateUniforms());
        
        // Frequency scaling folder
        const freqScaleFolder = this.gui.addFolder('Frequency Scaling');
        
        freqScaleFolder.add(this.params.frequencyScale, 'x', 0.1, 5, 0.01)
            .name('X Scale')
            .onChange(() => this.updateUniforms());
        
        freqScaleFolder.add(this.params.frequencyScale, 'y', 0.1, 5, 0.01)
            .name('Y Scale')
            .onChange(() => this.updateUniforms());
        
        freqScaleFolder.add(this.params.frequencyScale, 'z', 0.1, 5, 0.01)
            .name('Z Scale')
            .onChange(() => this.updateUniforms());
        
        // NOISE_MASK folder
        const maskFolder = this.gui.addFolder('NOISE_MASK');
        
        maskFolder.add(this.params.noiseMask, 'frequency', 0.1, 10, 0.01)
            .name('Frequency')
            .onChange(() => this.updateUniforms());
            
        maskFolder.add(this.params.noiseMask, 'amplitude', 0.1, 2, 0.01)
            .name('Amplitude')
            .onChange(() => this.updateUniforms());
            
        maskFolder.add(this.params.noiseMask, 'gain', 1, 4, 0.01)
            .name('Gain')
            .onChange(() => this.updateUniforms());
        
        // Domain warping subfolder
        const maskWarpFolder = maskFolder.addFolder('Domain Warping');
        
        maskWarpFolder.add(this.params.noiseMask, 'warpIntensity', 0, 2, 0.01)
            .name('Intensity')
            .onChange(() => this.updateUniforms());
            
        maskWarpFolder.add(this.params.noiseMask, 'warpScale', 0.1, 5, 0.01)
            .name('Scale')
            .onChange(() => this.updateUniforms());
        
        // Layer controls subfolder
        const layerControlsFolder = maskFolder.addFolder('Layer Controls');
        
        layerControlsFolder.add(this.params.noiseMask, 'cutoff1', 0, 1, 0.01)
            .name('Cutoff 1')
            .onChange(() => this.updateUniforms());
            
        layerControlsFolder.add(this.params.noiseMask, 'cutoff2', 0, 1, 0.01)
            .name('Cutoff 2')
            .onChange(() => this.updateUniforms());
            
        layerControlsFolder.add(this.params.noiseMask, 'softness', 0, 1, 0.01)
            .name('Softness')
            .onChange(() => this.updateUniforms());
        
        // BASE_NOISE folder
        const baseNoiseFolder = this.gui.addFolder('BASE_NOISE');
        
        // BASE1 subfolder
        this.setupBaseNoiseControlsForLayer(
            baseNoiseFolder, 
            this.params.baseNoise.base1, 
            'base1', 
            'Layer 1 (Blue)'
        );
        
        // BASE2 subfolder
        this.setupBaseNoiseControlsForLayer(
            baseNoiseFolder, 
            this.params.baseNoise.base2, 
            'base2', 
            'Layer 2 (Green)'
        );
        
        // BASE3 subfolder
        this.setupBaseNoiseControlsForLayer(
            baseNoiseFolder, 
            this.params.baseNoise.base3, 
            'base3', 
            'Layer 3 (Red)'
        );
        
        // Expand folders
        speedFolder.open();
        freqScaleFolder.open();
        maskFolder.open();
        maskWarpFolder.open();
        layerControlsFolder.open();
        baseNoiseFolder.open();
        
        // Add some styling to the GUI
        this.addStyles();
    }
    
    /**
     * Set up controls for a base noise layer
     * @param {object} parentFolder - The parent folder in the GUI
     * @param {object} layerParams - Parameters for this layer
     * @param {string} layerName - Name of the layer (base1, base2, base3)
     * @param {string} displayName - Display name for the folder
     */
    setupBaseNoiseControlsForLayer(parentFolder, layerParams, layerName, displayName) {
        const layerFolder = parentFolder.addFolder(displayName);
        
        // Active toggle
        layerFolder.add(layerParams, 'active')
            .name('Active')
            .onChange(() => this.updateUniforms());
        
        // Position offsets subfolder
        const offsetsFolder = layerFolder.addFolder('Position Offsets');
        
        offsetsFolder.add(layerParams.offset, 'x', -10, 10, 0.1)
            .name('X Offset')
            .onChange(() => this.updateUniforms());
            
        offsetsFolder.add(layerParams.offset, 'y', -10, 10, 0.1)
            .name('Y Offset')
            .onChange(() => this.updateUniforms());
            
        offsetsFolder.add(layerParams.offset, 'z', -10, 10, 0.1)
            .name('Z Offset')
            .onChange(() => this.updateUniforms());
            
        offsetsFolder.add(layerParams.offset, 'frequency', -2, 2, 0.1)
            .name('Freq. Offset')
            .onChange(() => this.updateUniforms());
            
        offsetsFolder.add(layerParams.offset, 'amplitude', -1, 1, 0.1)
            .name('Amp. Offset')
            .onChange(() => this.updateUniforms());
            
        // Noise controls
        layerFolder.add(layerParams, 'frequency', 0.1, 10, 0.01)
            .name('Frequency')
            .onChange(() => this.updateUniforms());
            
        layerFolder.add(layerParams, 'amplitude', 0.1, 2, 0.01)
            .name('Amplitude')
            .onChange(() => this.updateUniforms());
            
        layerFolder.add(layerParams, 'gain', 1, 4, 0.01)
            .name('Gain')
            .onChange(() => this.updateUniforms());
            
        // Domain warping subfolder
        const warpFolder = layerFolder.addFolder('Domain Warping');
        
        warpFolder.add(layerParams, 'warpIntensity', 0, 2, 0.01)
            .name('Intensity')
            .onChange(() => this.updateUniforms());
            
        warpFolder.add(layerParams, 'warpScale', 0.1, 5, 0.01)
            .name('Scale')
            .onChange(() => this.updateUniforms());
            
        warpFolder.add(layerParams, 'warpType', this.warpTypes)
            .name('Warp Type')
            .onChange(() => this.updateUniforms());
            
        // Color gradient display (simplified for now)
        const gradientFolder = layerFolder.addFolder('Color Gradient');
        
        // Simple color display
        const colorDisplay = document.createElement('div');
        colorDisplay.style.width = '100%';
        colorDisplay.style.height = '20px';
        colorDisplay.style.marginTop = '8px';
        colorDisplay.style.marginBottom = '8px';
        colorDisplay.style.background = `linear-gradient(to right, ${this.colorGradients[layerName].getStops().map(stop => `${stop.color} ${stop.pos * 100}%`).join(', ')})`;
        colorDisplay.style.borderRadius = '3px';
        
        const colorDisplayContainer = document.createElement('div');
        colorDisplayContainer.className = 'color-gradient-display';
        colorDisplayContainer.appendChild(colorDisplay);
        
        gradientFolder.domElement.appendChild(colorDisplayContainer);
        
        // Open subfolders
        offsetsFolder.open();
        warpFolder.open();
        gradientFolder.open();
    }
    
    /**
     * Update shader uniforms based on UI control values
     */
    updateUniforms() {
        if (!this.app.shaderFilter || !this.app.shaderFilter.uniforms) return;
        
        const uniforms = this.app.shaderFilter.uniforms;
        
        // Update seed
        uniforms.u_seed = this.params.seed;
        
        // Update global parameters
        uniforms.u_frequency = this.params.globalFrequency;
        uniforms.u_amplitude = this.params.globalAmplitude;
        
        // Update speed uniforms
        uniforms.u_speed_x = this.params.speed.x;
        uniforms.u_speed_y = this.params.speed.y;
        uniforms.u_speed_z = this.params.speed.z;
        
        // Update frequency scaling uniforms
        uniforms.u_freq_scale_x = this.params.frequencyScale.x;
        uniforms.u_freq_scale_y = this.params.frequencyScale.y;
        uniforms.u_freq_scale_z = this.params.frequencyScale.z;
        
        // Update NOISE_MASK uniforms
        uniforms.u_mask_frequency = this.params.noiseMask.frequency;
        uniforms.u_mask_amplitude = this.params.noiseMask.amplitude;
        uniforms.u_mask_gain = this.params.noiseMask.gain;
        uniforms.u_warp_intensity = this.params.noiseMask.warpIntensity;
        uniforms.u_warp_scale = this.params.noiseMask.warpScale;
        uniforms.u_cutoff1 = this.params.noiseMask.cutoff1;
        uniforms.u_cutoff2 = this.params.noiseMask.cutoff2;
        uniforms.u_softness = this.params.noiseMask.softness;
        
        // Update BASE1 uniforms
        this.updateBaseLayerUniforms(uniforms, this.params.baseNoise.base1, 'base1');
        
        // Update BASE2 uniforms
        this.updateBaseLayerUniforms(uniforms, this.params.baseNoise.base2, 'base2');
        
        // Update BASE3 uniforms
        this.updateBaseLayerUniforms(uniforms, this.params.baseNoise.base3, 'base3');
    }
    
    /**
     * Update uniforms for a specific base layer
     * @param {object} uniforms - Shader uniforms object
     * @param {object} layerParams - Layer parameters from UI
     * @param {string} layerPrefix - Prefix for uniform names (base1, base2, base3)
     */
    updateBaseLayerUniforms(uniforms, layerParams, layerPrefix) {
        // Basic parameters
        uniforms[`u_${layerPrefix}_active`] = layerParams.active;
        uniforms[`u_${layerPrefix}_offset_x`] = layerParams.offset.x;
        uniforms[`u_${layerPrefix}_offset_y`] = layerParams.offset.y;
        uniforms[`u_${layerPrefix}_offset_z`] = layerParams.offset.z;
        uniforms[`u_${layerPrefix}_freq_offset`] = layerParams.offset.frequency;
        uniforms[`u_${layerPrefix}_amp_offset`] = layerParams.offset.amplitude;
        uniforms[`u_${layerPrefix}_frequency`] = layerParams.frequency;
        uniforms[`u_${layerPrefix}_amplitude`] = layerParams.amplitude;
        uniforms[`u_${layerPrefix}_gain`] = layerParams.gain;
        
        // Warping parameters
        uniforms[`u_${layerPrefix}_warp_intensity`] = layerParams.warpIntensity;
        uniforms[`u_${layerPrefix}_warp_scale`] = layerParams.warpScale;
        
        // Convert warp type string to integer value
        uniforms[`u_${layerPrefix}_warp_type`] = this.warpTypes.indexOf(layerParams.warpType);
        
        // Update gradient texture uniform instead of array
        uniforms[`u_${layerPrefix}_gradientTex`] = this.colorGradients[layerPrefix].getTexture();
    }
    
    /**
     * Get the DOM element for this GUI
     * @returns {HTMLElement} The GUI DOM element
     */
    getElement() {
        return this.gui.domElement;
    }
    
    /**
     * Add custom styles for the GUI
     */
    addStyles() {
        if (document.getElementById('noise-controls-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'noise-controls-styles';
        style.textContent = `
            .noise-controls {
                max-height: 100%;
                overflow-y: auto;
            }
            
            .lil-gui {
                --background-color: transparent;
                --text-color: #f0f0f0;
                --title-background-color: rgba(0, 0, 0, 0.2);
                --title-text-color: #fff;
                --widget-color: #444;
                --hover-color: #666;
                --focus-color: #0088ff;
                --number-color: #0088ff;
                --string-color: #ff8800;
            }
            
            .lil-gui .controller {
                border-left: 3px solid rgba(0, 0, 0, 0);
            }
            
            .lil-gui .controller:hover {
                border-left-color: var(--focus-color);
                background: rgba(0, 0, 0, 0.1);
            }
            
            .color-gradient-display {
                padding: 0 8px;
            }
        `;
        document.head.appendChild(style);
    }
}