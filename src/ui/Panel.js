// This file handles the collapsible side panel UI.
// It creates the panel element, manages its visibility, and allows for adding content elements dynamically.

class Panel {
    constructor() {
        this.panel = document.createElement('div');
        this.panel.className = 'panel';
        this.panel.style.position = 'absolute';
        this.panel.style.top = '10px';
        this.panel.style.left = '10px';
        this.panel.style.width = '250px';
        this.panel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        this.panel.style.border = '1px solid #ccc';
        this.panel.style.borderRadius = '5px';
        this.panel.style.padding = '10px';
        this.panel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        this.panel.style.display = 'none'; // Initially hidden

        this.toggleButton = document.createElement('button');
        this.toggleButton.innerText = '☰';
        this.toggleButton.style.position = 'absolute';
        this.toggleButton.style.top = '10px';
        this.toggleButton.style.left = '10px';
        this.toggleButton.style.zIndex = '1000';
        this.toggleButton.onclick = () => this.toggle();

        document.body.appendChild(this.toggleButton);
        document.body.appendChild(this.panel);
    }

    toggle() {
        if (this.panel.style.display === 'none') {
            this.panel.style.display = 'block';
        } else {
            this.panel.style.display = 'none';
        }
    }

    addContent(content) {
        this.panel.appendChild(content);
    }
}

export default Panel;