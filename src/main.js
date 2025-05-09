// src/main.js

import * as PIXI from 'pixi.js';
import ShaderLoader from './utils/ShaderLoader.js';
import Panel from './ui/Panel.js';
import NoiseControls from './ui/NoiseControls.js';
import ColorGradient from './utils/ColorGradient.js';

class NoiseCloudApp {
  constructor() {
    // Initialize PixiJS application
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      resizeTo: window, // Auto-resize with the window
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    
    // Add the canvas to the DOM
    document.body.appendChild(this.app.view);
    
    // Handle window resize
    this.setupResizeHandler();
    
    // Initialize app state and resources
    this.init();
  }
  
  setupResizeHandler() {
    window.addEventListener('resize', this.onResize.bind(this));
  }
  
  onResize() {
    // The app.resizeTo: window handles basic resizing,
    // but we might need to update other objects or uniforms when resizing
    if (this.shaderSprite) {
      this.shaderSprite.width = this.app.screen.width;
      this.shaderSprite.height = this.app.screen.height;
    }
    
    // Update shader uniforms if needed
    if (this.shaderFilter && this.shaderFilter.uniforms) {
      this.shaderFilter.uniforms.u_resolution = [
        this.app.screen.width, 
        this.app.screen.height
      ];
    }
  }
  
  async init() {
    try {
      // Load the shader source
      const fragmentShader = await ShaderLoader.load('./src/shaders/perlin_noise.frag');
      
      // Create a full-screen sprite to apply our shader
      this.shaderSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      this.shaderSprite.width = this.app.screen.width;
      this.shaderSprite.height = this.app.screen.height;
      
      // Initialize color gradients
      const blueGradient = new ColorGradient([
        { color: '#0000FF', pos: 0.0 },  // Deep blue
        { color: '#00FFFF', pos: 0.5 },  // Cyan
        { color: '#FFFFFF', pos: 1.0 }   // White
      ]);
      
      const greenGradient = new ColorGradient([
        { color: '#006400', pos: 0.0 },  // Dark green
        { color: '#00FF00', pos: 0.5 },  // Bright green
        { color: '#FFFF00', pos: 1.0 }   // Yellow
      ]);
      
      const redGradient = new ColorGradient([
        { color: '#800000', pos: 0.0 },  // Dark red
        { color: '#FF0000', pos: 0.5 },  // Bright red
        { color: '#FFA500', pos: 1.0 }   // Orange
      ]);
      
      // Create a new PIXI.Shader with default uniform values
      const shaderUniforms = {
        // Core uniforms
        u_resolution: [this.app.screen.width, this.app.screen.height],
        u_time: 0.0,
        u_seed: 12345.0,
        u_frequency: 1.0,
        u_amplitude: 1.0,
        u_speed_x: 0.1,
        u_speed_y: 0.1,
        u_speed_z: 0.05,
        u_freq_scale_x: 1.0,
        u_freq_scale_y: 1.0,
        u_freq_scale_z: 1.0,
        
        // NOISE_MASK uniforms
        u_mask_frequency: 1.0,
        u_mask_amplitude: 1.0,
        u_mask_gain: 2.0,
        u_warp_intensity: 0.5,
        u_warp_scale: 1.0,
        u_cutoff1: 0.33,
        u_cutoff2: 0.66,
        u_softness: 0.5,
        
        // BASE1 uniforms
        u_base1_active: true,
        u_base1_offset_x: 0.0,
        u_base1_offset_y: 0.0,
        u_base1_offset_z: 0.0,
        u_base1_freq_offset: 1.0,
        u_base1_amp_offset: 1.0,
        u_base1_frequency: 1.0,
        u_base1_amplitude: 1.0,
        u_base1_gain: 2.0,
        u_base1_warp_intensity: 0.3,
        u_base1_warp_scale: 1.0,
        u_base1_warp_type: 0, // 0=Add
        u_base1_gradientTex: blueGradient.getTexture(),
        
        // BASE2 uniforms
        u_base2_active: true,
        u_base2_offset_x: 1.0,
        u_base2_offset_y: 1.0,
        u_base2_offset_z: 1.0,
        u_base2_freq_offset: 1.5,
        u_base2_amp_offset: 0.8,
        u_base2_frequency: 1.5,
        u_base2_amplitude: 0.8,
        u_base2_gain: 2.0,
        u_base2_warp_intensity: 0.3,
        u_base2_warp_scale: 1.0,
        u_base2_warp_type: 0, // 0=Add
        u_base2_gradientTex: greenGradient.getTexture(),
        
        // BASE3 uniforms
        u_base3_active: true,
        u_base3_offset_x: 2.0,
        u_base3_offset_y: 2.0,
        u_base3_offset_z: 2.0,
        u_base3_freq_offset: 2.0,
        u_base3_amp_offset: 0.6,
        u_base3_frequency: 2.0,
        u_base3_amplitude: 0.6,
        u_base3_gain: 2.0,
        u_base3_warp_intensity: 0.3,
        u_base3_warp_scale: 1.0,
        u_base3_warp_type: 0, // 0=Add
        u_base3_gradientTex: redGradient.getTexture()
      };

      this.shaderFilter = new PIXI.Filter(undefined, fragmentShader, shaderUniforms);
      
      // Apply the filter to the sprite
      this.shaderSprite.filters = [this.shaderFilter];
      
      // Add the sprite to the stage
      this.app.stage.addChild(this.shaderSprite);
      
      // Setup animation ticker
      this.setupTicker();
      
      // Initialize UI components
      this.initUI();
      
      console.log('Shader successfully loaded and applied');
    } catch (error) {
      console.error('Failed to initialize shader:', error);
    }
  }
  
  initUI() {
    // Create the control panel
    this.panel = new Panel({
      title: 'Noise Cloud Controls',
      position: 'right',
      width: '300px',
      collapsed: false,
      theme: 'dark'
    });
    
    // Create noise controls and add them to the panel
    this.noiseControls = new NoiseControls(this);
    this.panel.addContent(this.noiseControls.getElement());
    
    // Initialize controls with current uniform values
    this.noiseControls.updateUniforms();
  }
  
  setupTicker() {
    // Animation loop using PIXI.Ticker
    let startTime = Date.now();
    
    this.app.ticker.add(() => {
      // Update time uniform for animation
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;
      
      if (this.shaderFilter && this.shaderFilter.uniforms) {
        this.shaderFilter.uniforms.u_time = elapsedSeconds;
      }
    });
  }
}

// Start the application when the DOM is ready
window.onload = () => {
  const app = new NoiseCloudApp();
};

export default NoiseCloudApp;