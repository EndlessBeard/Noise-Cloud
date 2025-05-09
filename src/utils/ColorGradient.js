/**
 * ColorGradient.js - Utility for creating and managing color gradients
 * Uses tinygradient internally to manage gradients
 */
import tinygradient from 'tinygradient';
import * as PIXI from 'pixi.js';

export default class ColorGradient {
    /**
     * Create a new color gradient
     * @param {Array} stops - Array of color stops, each can be a string like '#ff0000' or an object {color: '#ff0000', pos: 0.5}
     */
    constructor(stops = []) {
        this.defaultStops = [
            { color: '#0000FF', pos: 0.0 },  // Deep blue
            { color: '#00FFFF', pos: 0.5 },  // Cyan
            { color: '#FFFFFF', pos: 1.0 }   // White
        ];
        
        this.stops = stops.length > 0 ? stops : this.defaultStops;
        this.updateGradient();
        this.createTexture(); // Create the texture when the gradient is created
    }
    
    /**
     * Update the internal gradient with current stops
     */
    updateGradient() {
        // Create the tinygradient instance
        this.gradient = tinygradient(this.stops);
    }
    
    /**
     * Create a texture from the gradient
     * @param {number} width - Width of the gradient texture (default 256)
     */
    createTexture(width = 256) {
        // Create a canvas to draw the gradient
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = 1; // 1D texture only needs 1 pixel height
        
        const ctx = canvas.getContext('2d');
        
        // Create a linear gradient
        const gradientFill = ctx.createLinearGradient(0, 0, width, 0);
        
        // Add color stops to the gradient
        this.stops.forEach(stop => {
            gradientFill.addColorStop(stop.pos, stop.color);
        });
        
        // Fill the canvas with the gradient
        ctx.fillStyle = gradientFill;
        ctx.fillRect(0, 0, width, 1);
        
        // Create a PIXI texture from the canvas
        if (this.texture) {
            this.texture.destroy(true);
        }
        this.texture = PIXI.Texture.from(canvas);
        
        return this.texture;
    }
    
    /**
     * Update the texture after stops have changed
     */
    updateTexture() {
        this.createTexture();
    }
    
    /**
     * Add a new color stop to the gradient
     * @param {string} color - Color as hex string (e.g., '#ff0000')
     * @param {number} position - Position in the gradient (0-1)
     */
    addStop(color, position) {
        // Ensure position is between 0 and 1
        position = Math.max(0, Math.min(1, position));
        
        // Add new stop
        this.stops.push({ color: color, pos: position });
        
        // Sort stops by position
        this.stops.sort((a, b) => a.pos - b.pos);
        
        // Update the gradient and texture
        this.updateGradient();
        this.updateTexture();
        
        return this.stops;
    }
    
    /**
     * Remove a color stop at the given index
     * @param {number} index - Index of the stop to remove
     */
    removeStop(index) {
        if (index >= 0 && index < this.stops.length && this.stops.length > 2) {
            // Don't allow fewer than 2 stops
            this.stops.splice(index, 1);
            this.updateGradient();
            this.updateTexture();
        }
        
        return this.stops;
    }
    
    /**
     * Update a color stop at the given index
     * @param {number} index - Index of the stop to update
     * @param {string} color - New color as hex string (e.g., '#ff0000')
     * @param {number} position - New position in the gradient (0-1)
     */
    updateStop(index, color, position) {
        if (index >= 0 && index < this.stops.length) {
            position = Math.max(0, Math.min(1, position));
            this.stops[index] = { color: color, pos: position };
            
            // Sort stops by position
            this.stops.sort((a, b) => a.pos - b.pos);
            
            this.updateGradient();
            this.updateTexture();
        }
        
        return this.stops;
    }
    
    /**
     * Get the PIXI texture for this gradient
     * @returns {PIXI.Texture} - The gradient texture
     */
    getTexture() {
        return this.texture;
    }
    
    /**
     * Get the color at a specific position in the gradient
     * @param {number} position - Position in the gradient (0-1)
     * @returns {Object} - RGBA color object {r, g, b, a}
     */
    getColorAt(position) {
        const color = this.gradient.rgbAt(position);
        return {
            r: color._r / 255,
            g: color._g / 255,
            b: color._b / 255,
            a: 1.0
        };
    }
    
    /**
     * Get an array of color values to use as a uniform in a shader
     * @param {number} count - Number of samples to take from the gradient
     * @returns {Float32Array} - Array of R,G,B,A values normalized to 0-1
     */
    getColorArray(count = 16) {
        const colors = new Float32Array(count * 4);
        
        for (let i = 0; i < count; i++) {
            const pos = i / (count - 1);
            const color = this.getColorAt(pos);
            
            colors[i * 4 + 0] = color.r;
            colors[i * 4 + 1] = color.g;
            colors[i * 4 + 2] = color.b;
            colors[i * 4 + 3] = color.a;
        }
        
        return colors;
    }
    
    /**
     * Get the current gradient stops
     * @returns {Array} - Array of color stop objects
     */
    getStops() {
        return this.stops;
    }
}