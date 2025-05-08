/**
 * NoiseControls.js - UI controls for noise parameters
 */
import { GUI } from 'lil-gui';

export default class NoiseControls {
    constructor(app) {
        this.app = app;
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
        
        // Expand all folders by default
        speedFolder.open();
        freqScaleFolder.open();
        
        // Add some styling to the GUI
        this.addStyles();
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
        `;
        document.head.appendChild(style);
    }
}