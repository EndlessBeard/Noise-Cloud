/**
 * Panel.js - A collapsible side panel for UI controls
 */
export default class Panel {
    constructor(options = {}) {
        // Default options
        const defaults = {
            position: 'right', // 'left' or 'right'
            width: '300px',
            title: 'Controls',
            collapsed: false,
            theme: 'dark', // 'light' or 'dark'
        };
        
        this.options = { ...defaults, ...options };
        this.isCollapsed = this.options.collapsed;
        
        // Create DOM elements
        this.createPanelElements();
        
        // Add event listeners
        this.setupEventListeners();
    }
    
    /**
     * Create all the necessary DOM elements for the panel
     */
    createPanelElements() {
        // Create the main panel container
        this.panel = document.createElement('div');
        this.panel.className = `control-panel ${this.options.theme} ${this.options.position}`;
        this.panel.style.width = this.options.width;
        this.panel.style.maxWidth = '80vw';
        
        if (this.isCollapsed) {
            this.panel.classList.add('collapsed');
        }
        
        // Create the panel header
        const header = document.createElement('div');
        header.className = 'panel-header';
        
        // Create the panel title
        const title = document.createElement('h3');
        title.className = 'panel-title';
        title.textContent = this.options.title;
        
        // Create the toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'panel-toggle';
        this.toggleBtn.innerHTML = this.isCollapsed ? '☰' : '×';
        this.toggleBtn.setAttribute('aria-label', this.isCollapsed ? 'Expand panel' : 'Collapse panel');
        
        // Create the content container
        this.content = document.createElement('div');
        this.content.className = 'panel-content';
        
        // Assemble the panel
        header.appendChild(title);
        header.appendChild(this.toggleBtn);
        this.panel.appendChild(header);
        this.panel.appendChild(this.content);
        
        // Add the panel to the document
        document.body.appendChild(this.panel);
        
        // Add CSS
        this.addStyles();
    }
    
    /**
     * Set up event listeners for the panel
     */
    setupEventListeners() {
        this.toggleBtn.addEventListener('click', () => this.toggle());
    }
    
    /**
     * Toggle the panel's collapsed state
     */
    toggle() {
        this.isCollapsed = !this.isCollapsed;
        this.panel.classList.toggle('collapsed');
        this.toggleBtn.innerHTML = this.isCollapsed ? '☰' : '×';
        this.toggleBtn.setAttribute('aria-label', this.isCollapsed ? 'Expand panel' : 'Collapse panel');
    }
    
    /**
     * Add content to the panel
     * @param {HTMLElement} element - The element to add to the panel
     */
    addContent(element) {
        this.content.appendChild(element);
    }
    
    /**
     * Remove all content from the panel
     */
    clearContent() {
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }
    }
    
    /**
     * Add CSS styles to the document
     */
    addStyles() {
        if (document.getElementById('panel-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'panel-styles';
        style.textContent = `
            .control-panel {
                position: fixed;
                top: 0;
                height: 100vh;
                background-color: rgba(30, 30, 30, 0.95);
                color: #fff;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                transition: transform 0.3s ease;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
                overflow-y: auto;
            }
            
            .control-panel.right {
                right: 0;
                border-left: 1px solid #444;
                transform: translateX(0);
            }
            
            .control-panel.left {
                left: 0;
                border-right: 1px solid #444;
                transform: translateX(0);
            }
            
            .control-panel.collapsed.right {
                transform: translateX(calc(100% - 40px));
            }
            
            .control-panel.collapsed.left {
                transform: translateX(calc(-100% + 40px));
            }
            
            .control-panel.light {
                background-color: rgba(240, 240, 240, 0.95);
                color: #333;
                border-color: #ddd;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background-color: rgba(0, 0, 0, 0.2);
                cursor: move;
                user-select: none;
            }
            
            .light .panel-header {
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .panel-title {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
            }
            
            .panel-toggle {
                background: none;
                border: none;
                color: inherit;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 4px;
            }
            
            .panel-toggle:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .light .panel-toggle:hover {
                background-color: rgba(0, 0, 0, 0.1);
            }
            
            .panel-content {
                padding: 15px;
                flex-grow: 1;
                overflow-y: auto;
            }
            
            /* Make scrollbars prettier */
            .panel-content::-webkit-scrollbar {
                width: 8px;
            }
            
            .panel-content::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
            }
            
            .panel-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            
            .light .panel-content::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
}