/**
 * ColorGradient.js - Utility for creating and managing color gradients
 * Uses tinygradient internally to manage gradients
 */
import tinygradient from 'tinygradient';

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
    }
    
    /**
     * Update the internal gradient with current stops
     */
    updateGradient() {
        // Create the tinygradient instance
        this.gradient = tinygradient(this.stops);
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
        
        // Update the gradient
        this.updateGradient();
        
        return this.stops;
    }
    
    /**
     * Remove a color stop at the given index
     * @param {number} index - Index of the stop to remove
     */
    removeStop(index) {
        if (index >= 0 && index < this.stops.length) {
            this.stops.splice(index, 1);
            this.updateGradient();
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
        }
        
        return this.stops;
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