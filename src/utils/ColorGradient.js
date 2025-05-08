// This file provides functionality for managing color gradients, including selecting color stops and passing this data to the shader.

class ColorGradient {
    constructor() {
        this.stops = [];
    }

    addStop(color, position) {
        this.stops.push({ color, position });
        this.stops.sort((a, b) => a.position - b.position);
    }

    removeStop(position) {
        this.stops = this.stops.filter(stop => stop.position !== position);
    }

    getGradient() {
        return this.stops.map(stop => stop.color);
    }

    getColorAt(position) {
        if (this.stops.length === 0) return null;

        // Ensure position is between 0 and 1
        position = Math.max(0, Math.min(1, position));

        for (let i = 0; i < this.stops.length - 1; i++) {
            const start = this.stops[i];
            const end = this.stops[i + 1];

            if (position >= start.position && position <= end.position) {
                const ratio = (position - start.position) / (end.position - start.position);
                return this.interpolateColor(start.color, end.color, ratio);
            }
        }

        return this.stops[this.stops.length - 1].color; // Return last color if position is beyond the last stop
    }

    interpolateColor(color1, color2, ratio) {
        const r = Math.round(color1.r + (color2.r - color1.r) * ratio);
        const g = Math.round(color1.g + (color2.g - color1.g) * ratio);
        const b = Math.round(color1.b + (color2.b - color1.b) * ratio);
        return { r, g, b };
    }
}

export default ColorGradient;