// This file manages the UI elements for controlling noise parameters using lil-gui.
// It organizes controls into subpanels for overall noise settings and specific noise functions.

import * as dat from 'lil-gui';

class NoiseControls {
    constructor(shader) {
        this.shader = shader;
        this.gui = new dat.GUI();
        this.initControls();
    }

    initControls() {
        const overallNoiseFolder = this.gui.addFolder('Overall Noise Controls');
        overallNoiseFolder.add(this.shader.uniforms.u_seed, 'value', 0, 100).name('Seed');
        overallNoiseFolder.add(this.shader.uniforms.u_globalFrequency, 'value', 0, 10).name('Global Frequency');
        overallNoiseFolder.add(this.shader.uniforms.u_globalAmplitude, 'value', 0, 10).name('Global Amplitude');
        
        const speedFolder = overallNoiseFolder.addFolder('Speed Controls');
        speedFolder.add(this.shader.uniforms.u_xSpeed, 'value', -10, 10).name('X Speed');
        speedFolder.add(this.shader.uniforms.u_ySpeed, 'value', -10, 10).name('Y Speed');
        speedFolder.add(this.shader.uniforms.u_zSpeed, 'value', -10, 10).name('Z Speed');
        speedFolder.add(this.shader.uniforms.u_freqScaleX, 'value', 0, 10).name('Frequency Scaling X');
        speedFolder.add(this.shader.uniforms.u_freqScaleY, 'value', 0, 10).name('Frequency Scaling Y');
        speedFolder.add(this.shader.uniforms.u_freqScaleZ, 'value', 0, 10).name('Frequency Scaling Z');

        overallNoiseFolder.open();

        // Additional subpanels for NOISE_MASK and BASE_NOISE can be added here
    }
}

export default NoiseControls;