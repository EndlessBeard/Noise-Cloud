// src/utils/ShaderLoader.js

/**
 * Utility for loading shader files asynchronously
 */
class ShaderLoader {
  /**
   * Load a shader file from a given path
   * @param {string} path - Path to the shader file
   * @returns {Promise<string>} - The shader source code
   */
  static async load(path) {
    try {
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`Failed to load shader: ${path} (${response.status} ${response.statusText})`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error loading shader:', error);
      throw error;
    }
  }
}

export default ShaderLoader;