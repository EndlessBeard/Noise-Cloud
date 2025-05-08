// src/main.js

import * as PIXI from 'pixi.js';
import ShaderLoader from './utils/ShaderLoader.js';

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
      
      // Create a new PIXI.Shader
      const shaderUniforms = {
        u_resolution: [this.app.screen.width, this.app.screen.height],
        u_time: 0.0,
        u_seed: 12345.0,  // Initial seed value
        u_frequency: 1.0,
        u_amplitude: 1.0,
        u_speed_x: 0.1,
        u_speed_y: 0.1,
        u_speed_z: 0.05,
        u_freq_scale_x: 1.0,
        u_freq_scale_y: 1.0,
        u_freq_scale_z: 1.0
      };

      this.shaderFilter = new PIXI.Filter(undefined, fragmentShader, shaderUniforms);
      
      // Apply the filter to the sprite
      this.shaderSprite.filters = [this.shaderFilter];
      
      // Add the sprite to the stage
      this.app.stage.addChild(this.shaderSprite);
      
      // Setup animation ticker
      this.setupTicker();
      
      console.log('Shader successfully loaded and applied');
    } catch (error) {
      console.error('Failed to initialize shader:', error);
    }
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