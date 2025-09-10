/**
 * Design Token Manager
 * A comprehensive tool for parsing, converting, and exporting design tokens
 * between multiple formats including W3C DTCG, CSS, SCSS, Tailwind, iOS, and Android
 */

/**
 * Main Design Token Manager class
 * Handles all token operations including parsing, conversion, and export
 */
class DesignTokenManager {
    constructor() {
        // Global state
        this.parsedTokens = {};
        this.currentFormat = 'css';
        
        // DOM elements
        this.elements = this.initializeElements();
        
        // Parsers and generators
        this.parsers = new TokenParsers();
        this.generators = new TokenGenerators();
        this.examples = new TokenExamples();
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize DOM elements with error handling
     */
    initializeElements() {
        const elements = {};
        const elementIds = [
            'token-input', 'file-input', 'file-upload', 'parse-btn',
            'validation-status', 'token-tree', 'output-content', 
            'output-code', 'export-all-btn'
        ];
        
        elementIds.forEach(id => {
            elements[id.replace(/-/g, '_')] = DOMHelpers.getElement(id);
        });
        
        return elements;
    }
    
    /**
     * Initialize the application
     */
    init() {
        try {
            this.setupEventListeners();
            this.updateValidationStatus('pending', 'Ready to parse');
            console.log('Design Token Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Design Token Manager:', error);
        }
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Input tabs
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchInputTab(tab.dataset.tab));
        });
        
        // Output tabs  
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchOutputTab(tab.dataset.format));
        });
        
        // Parse button
        if (this.elements.parse_btn) {
            this.elements.parse_btn.addEventListener('click', () => this.parseTokens());
        }
        
        // File upload handlers
        this.setupFileHandlers();
        
        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => this.loadExample(btn.dataset.example));
        });
        
        // Export button
        if (this.elements.export_all_btn) {
            this.elements.export_all_btn.addEventListener('click', () => this.exportAll());
        }
        
        // Make global functions available
        window.toggleGroup = (groupType) => this.toggleGroup(groupType);
        window.copyOutput = () => this.copyOutput();
        window.exportAll = () => this.exportAll();
    }
    
    /**
     * Set up file handling events
     */
    setupFileHandlers() {
        if (!this.elements.file_upload || !this.elements.file_input) return;
        
        // File upload click
        this.elements.file_upload.addEventListener('click', () => {
            this.elements.file_input.click();
        });
        
        // Drag and drop
        this.elements.file_upload.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.file_upload.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.elements.file_upload.addEventListener('drop', (e) => this.handleFileDrop(e));
        
        // File selection
        this.elements.file_input.addEventListener('change', (e) => this.handleFileSelect(e));
    }
    
    /**
     * Switch input tab
     */
    switchInputTab(tabName) {
        // Update tabs
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content
        document.querySelectorAll('.input-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });
    }
    
    /**
     * Switch output tab
     */
    switchOutputTab(format) {
        this.currentFormat = format;
        
        // Update tabs
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.format === format);
        });
        
        this.updateOutput();
    }
    
    /**
     * Load example tokens
     */
    loadExample(exampleName) {
        if (!this.elements.token_input) return;
        
        const exampleData = this.examples.get(exampleName);
        if (exampleData) {
            this.elements.token_input.value = exampleData;
            this.switchInputTab('paste');
            this.parseTokens();
        }
    }
    
    /**
     * Parse tokens from input
     */
    parseTokens() {
        if (!this.elements.token_input) return;
        
        const input = this.elements.token_input.value.trim();
        
        if (!input) {
            this.updateValidationStatus('invalid', 'No input provided');
            return;
        }
        
        try {
            this.updateValidationStatus('pending', 'Parsing...');
            
            // Determine format and parse
            const tokens = this.parsers.parseInput(input);
            
            this.parsedTokens = tokens;
            const tokenCount = Object.keys(tokens).length;
            this.updateValidationStatus('valid', `${tokenCount} tokens parsed`);
            
            this.updateTokenTree();
            this.updateOutput();
            
            if (this.elements.export_all_btn) {
                this.elements.export_all_btn.disabled = false;
            }
            
        } catch (error) {
            this.updateValidationStatus('invalid', `Error: ${error.message}`);
            this.parsedTokens = {};
            this.clearOutputs();
            
            if (this.elements.export_all_btn) {
                this.elements.export_all_btn.disabled = true;
            }
        }
    }
    
    /**
     * Update validation status display
     */
    updateValidationStatus(status, message) {
        if (!this.elements.validation_status) return;
        
        const statusIcon = this.elements.validation_status.querySelector('.status-icon');
        const statusText = this.elements.validation_status.querySelector('span:last-child');
        
        if (statusIcon) {
            statusIcon.className = `status-icon status-${status}`;
        }
        if (statusText) {
            statusText.textContent = message;
        }
    }
    
    /**
     * Update token tree display
     */
    updateTokenTree() {
        if (!this.elements.token_tree) return;
        
        const groups = this.groupTokensByType();
        let html = '';
        
        for (const [type, tokens] of Object.entries(groups)) {
            html += this.generateGroupHTML(type, tokens);
        }
        
        this.elements.token_tree.innerHTML = html;
    }
    
    /**
     * Group tokens by type
     */
    groupTokensByType() {
        const groups = {};
        
        for (const [name, token] of Object.entries(this.parsedTokens)) {
            const type = token.type || 'other';
            if (!groups[type]) groups[type] = [];
            groups[type].push({ name, ...token });
        }
        
        return groups;
    }
    
    /**
     * Generate HTML for a token group
     */
    generateGroupHTML(type, tokens) {
        let html = `
            <div class="token-group">
                <div class="token-group-header" onclick="toggleGroup('${type}')">
                    <span class="group-toggle">▼</span>
                    ${type.charAt(0).toUpperCase() + type.slice(1)} (${tokens.length})
                </div>
                <div class="token-list expanded" id="group-${type}">
        `;
        
        tokens.forEach(token => {
            const colorClass = token.type === 'color' ? 'color-token' : '';
            const colorSwatch = token.type === 'color' ? 
                `<span class="color-swatch" style="background-color: ${token.value}"></span>` : '';
            
            html += `
                <div class="token-item ${colorClass}">
                    <span class="token-name">${token.name}</span>
                    <span class="token-value">
                        ${colorSwatch}
                        ${token.value}
                    </span>
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }
    
    /**
     * Toggle token group visibility
     */
    toggleGroup(groupType) {
        const group = document.getElementById(`group-${groupType}`);
        const toggle = group?.previousElementSibling?.querySelector('.group-toggle');
        
        if (!group || !toggle) return;
        
        group.classList.toggle('expanded');
        toggle.classList.toggle('collapsed');
        
        group.style.display = group.classList.contains('expanded') ? 'block' : 'none';
    }
    
    /**
     * Update output display
     */
    updateOutput() {
        if (!this.elements.output_code) return;
        
        if (Object.keys(this.parsedTokens).length === 0) {
            this.elements.output_code.textContent = 'Parse tokens to see output formats';
            return;
        }
        
        try {
            const output = this.generators.generate(this.currentFormat, this.parsedTokens);
            this.elements.output_code.textContent = output;
        } catch (error) {
            this.elements.output_code.textContent = 
                `Error generating ${this.currentFormat} output: ${error.message}`;
        }
    }
    
    /**
     * Clear output displays
     */
    clearOutputs() {
        if (this.elements.token_tree) {
            this.elements.token_tree.innerHTML = '<div class="empty-state">Failed to parse tokens</div>';
        }
        if (this.elements.output_code) {
            this.elements.output_code.textContent = 'Fix parsing errors to see output';
        }
    }
    
    /**
     * Copy output to clipboard
     */
    async copyOutput() {
        if (!this.elements.output_code) return;
        
        const copyBtn = document.querySelector('.copy-output-btn');
        if (copyBtn) {
            await DOMHelpers.copyToClipboard(this.elements.output_code.textContent, copyBtn);
        }
    }
    
    /**
     * Export all formats
     */
    exportAll() {
        const formats = ['css', 'scss', 'js', 'json', 'tailwind', 'ios', 'android'];
        const files = {};
        
        formats.forEach(format => {
            try {
                const content = this.generators.generate(format, this.parsedTokens);
                const extension = this.getFileExtension(format);
                files[`tokens.${extension}`] = content;
            } catch (error) {
                console.error(`Error generating ${format}:`, error);
            }
        });
        
        // Create and download export file
        this.downloadExport(files);
    }
    
    /**
     * Get file extension for format
     */
    getFileExtension(format) {
        const extensions = {
            css: 'css',
            scss: 'scss', 
            js: 'js',
            json: 'json',
            tailwind: 'js',
            ios: 'swift',
            android: 'xml'
        };
        return extensions[format] || 'txt';
    }
    
    /**
     * Download export as JSON file
     */
    downloadExport(files) {
        try {
            const blob = new Blob([JSON.stringify(files, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'design-tokens-export.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export files:', error);
        }
    }
    
    // File handling methods
    handleDragOver(e) {
        e.preventDefault();
        this.elements.file_upload?.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.elements.file_upload?.classList.remove('dragover');
    }
    
    handleFileDrop(e) {
        e.preventDefault();
        this.elements.file_upload?.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.elements.token_input) {
                this.elements.token_input.value = e.target.result;
                this.switchInputTab('paste');
                this.parseTokens();
            }
        };
        reader.readAsText(file);
    }
}

/**
 * Token parsing utilities
 * Handles different input formats
 */
class TokenParsers {
    /**
     * Parse input based on detected format
     */
    parseInput(input) {
        if (input.startsWith('{')) {
            return this.parseJSON(input);
        } else if (input.includes('--')) {
            return this.parseCSS(input);
        } else if (input.includes('$')) {
            return this.parseSCSS(input);
        } else {
            throw new Error('Unrecognized format');
        }
    }
    
    /**
     * Parse W3C DTCG format JSON
     */
    parseJSON(text) {
        try {
            const data = JSON.parse(text);
            return this.flattenTokens(data);
        } catch (error) {
            throw new Error('Invalid JSON format');
        }
    }
    
    /**
     * Parse CSS variables
     */
    parseCSS(text) {
        const tokens = {};
        const cssVarRegex = /--([^:]+):\s*([^;]+);/g;
        let match;
        
        while ((match = cssVarRegex.exec(text)) !== null) {
            const name = match[1].trim();
            const value = match[2].trim();
            
            tokens[name] = {
                value: value,
                type: this.inferTokenType(value),
                path: name.split('-')
            };
        }
        
        return tokens;
    }
    
    /**
     * Parse SCSS variables
     */
    parseSCSS(text) {
        const tokens = {};
        const scssVarRegex = /\$([^:]+):\s*([^;]+);/g;
        let match;
        
        while ((match = scssVarRegex.exec(text)) !== null) {
            const name = match[1].trim();
            const value = match[2].trim();
            
            tokens[name] = {
                value: value,
                type: this.inferTokenType(value),
                path: name.split('-')
            };
        }
        
        return tokens;
    }
    
    /**
     * Flatten nested token structure
     */
    flattenTokens(obj, path = [], result = {}) {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = [...path, key];
            
            if (value && typeof value === 'object' && value.hasOwnProperty('value')) {
                // This is a token
                result[currentPath.join('.')] = {
                    ...value,
                    path: currentPath
                };
            } else if (value && typeof value === 'object') {
                // This is a group, recurse
                this.flattenTokens(value, currentPath, result);
            }
        }
        return result;
    }
    
    /**
     * Infer token type from value
     */
    inferTokenType(value) {
        const valueStr = value.toString().toLowerCase();
        
        if (valueStr.match(/^#[0-9a-f]{3,8}$/i) || 
            valueStr.match(/^rgb/) || 
            valueStr.match(/^hsl/) ||
            valueStr.includes('color')) {
            return 'color';
        } else if (valueStr.match(/\d+(px|rem|em|%)$/)) {
            return 'dimension';
        } else if (valueStr.match(/^\d+$/)) {
            return 'number';
        } else if (valueStr.includes('font') || valueStr.includes('family')) {
            return 'fontFamily';
        }
        
        return 'string';
    }
}

/**
 * Token output generators
 * Handles conversion to different formats
 */
class TokenGenerators {
    /**
     * Generate output in specified format
     */
    generate(format, tokens) {
        const generator = this.generators[format];
        if (!generator) {
            throw new Error(`Unknown format: ${format}`);
        }
        return generator(tokens);
    }
    
    /**
     * Available generators
     */
    generators = {
        css: (tokens) => {
            let output = ':root {\n';
            for (const [name, token] of Object.entries(tokens)) {
                const cssName = '--' + name.replace(/\./g, '-');
                output += `  ${cssName}: ${token.value};\n`;
            }
            output += '}';
            return output;
        },
        
        scss: (tokens) => {
            let output = '// Design Tokens\n\n';
            for (const [name, token] of Object.entries(tokens)) {
                const scssName = '$' + name.replace(/\./g, '-');
                output += `${scssName}: ${token.value};\n`;
            }
            return output;
        },
        
        js: (tokens) => {
            const jsObject = {};
            for (const [name, token] of Object.entries(tokens)) {
                const jsName = name.replace(/\./g, '_');
                jsObject[jsName] = token.value;
            }
            return `export const tokens = ${JSON.stringify(jsObject, null, 2)};`;
        },
        
        json: (tokens) => {
            const jsonTokens = {};
            for (const [name, token] of Object.entries(tokens)) {
                jsonTokens[name] = {
                    value: token.value,
                    type: token.type
                };
            }
            return JSON.stringify(jsonTokens, null, 2);
        },
        
        tailwind: (tokens) => {
            let output = '@import "tailwindcss";\n\n@theme {\n';
            
            for (const [name, token] of Object.entries(tokens)) {
                const themeVar = this.generateTailwindVariable(name, token);
                if (themeVar) {
                    output += `  ${themeVar}: ${token.value};\n`;
                }
            }
            
            output += '}';
            
            // Add usage example comment
            output += '\n\n/* Usage examples:\n';
            output += '   bg-primary-500     -> uses --color-primary-500\n';
            output += '   p-small           -> uses --spacing-small\n';
            output += '   text-body         -> uses --font-size-body\n';
            output += '*/';
            
            return output;
        },
        
        ios: (tokens) => {
            let output = '// Design Tokens for iOS\n\nimport UIKit\n\nstruct DesignTokens {\n';
            for (const [name, token] of Object.entries(tokens)) {
                const swiftName = name.replace(/\./g, '_').replace(/-/g, '_');
                if (token.type === 'color') {
                    output += `    static let ${swiftName} = UIColor(hex: "${token.value}")\n`;
                } else {
                    output += `    static let ${swiftName} = "${token.value}"\n`;
                }
            }
            output += '}';
            return output;
        },
        
        android: (tokens) => {
            let colors = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
            let dimens = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
            let strings = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
            
            let hasColors = false;
            let hasDimens = false;
            let hasStrings = false;
            
            for (const [name, token] of Object.entries(tokens)) {
                const androidName = name.replace(/\./g, '_').replace(/-/g, '_').toLowerCase();
                
                if (token.type === 'color') {
                    let colorValue = token.value;
                    if (!colorValue.startsWith('#')) {
                        colorValue = '#' + colorValue;
                    }
                    colors += `    <color name="${androidName}">${colorValue}</color>\n`;
                    hasColors = true;
                } else if (token.type === 'dimension') {
                    const dimenValue = this.convertDimensionForAndroid(token.value);
                    dimens += `    <dimen name="${androidName}">${dimenValue}</dimen>\n`;
                    hasDimens = true;
                } else {
                    strings += `    <string name="${androidName}">${token.value}</string>\n`;
                    hasStrings = true;
                }
            }
            
            colors += '</resources>';
            dimens += '</resources>';
            strings += '</resources>';
            
            let result = '';
            if (hasColors) result += `<!-- colors.xml -->\n${colors}`;
            if (hasDimens) {
                if (result) result += '\n\n';
                result += `<!-- dimens.xml -->\n${dimens}`;
            }
            if (hasStrings) {
                if (result) result += '\n\n';
                result += `<!-- strings.xml -->\n${strings}`;
            }
            
            return result || '<!-- No valid tokens found for Android conversion -->';
        }
    };
    
    /**
     * Generate Tailwind variable name
     */
    generateTailwindVariable(name, token) {
        const parts = name.split('.');
        let themeVar = '';
        
        if (token.type === 'color') {
            if (parts.length >= 2) {
                const colorName = parts[parts.length - 2];
                const shade = parts[parts.length - 1];
                themeVar = `--color-${colorName}-${shade}`;
            } else {
                const colorName = parts[parts.length - 1];
                themeVar = `--color-${colorName}`;
            }
        } else if (token.type === 'dimension') {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('spacing') || lowerName.includes('space') || 
                lowerName.includes('margin') || lowerName.includes('padding')) {
                const spaceName = parts[parts.length - 1];
                themeVar = `--spacing-${spaceName}`;
            } else if (lowerName.includes('font') && lowerName.includes('size')) {
                const sizeName = parts[parts.length - 1];
                themeVar = `--font-size-${sizeName}`;
            } else {
                const dimName = parts[parts.length - 1];
                themeVar = `--spacing-${dimName}`;
            }
        } else if (token.type === 'fontFamily') {
            const fontName = parts[parts.length - 1];
            themeVar = `--font-family-${fontName}`;
        } else if (token.type === 'fontWeight') {
            const weightName = parts[parts.length - 1];
            themeVar = `--font-weight-${weightName}`;
        } else {
            const tokenName = parts[parts.length - 1];
            themeVar = `--${tokenName}`;
        }
        
        return themeVar ? themeVar.replace(/\./g, '-').toLowerCase() : '';
    }
    
    /**
     * Convert dimension values for Android
     */
    convertDimensionForAndroid(value) {
        if (value.includes('px')) {
            return value; // Keep px as is
        } else if (value.includes('rem')) {
            // Convert rem to dp (rough conversion)
            const remValue = parseFloat(value);
            return `${Math.round(remValue * 16)}dp`;
        } else if (/^\d+$/.test(value)) {
            // Add dp unit if it's just a number
            return value + 'dp';
        }
        return value;
    }
}

/**
 * Example token sets
 * Provides sample data for different formats
 */
class TokenExamples {
    constructor() {
        this.examples = {
            w3c: `{
  "color": {
    "primary": {
      "100": { "value": "#e3f2fd", "type": "color" },
      "500": { "value": "#2196f3", "type": "color" },
      "900": { "value": "#0d47a1", "type": "color" }
    },
    "semantic": {
      "success": { "value": "{color.primary.500}", "type": "color" }
    }
  },
  "spacing": {
    "small": { "value": "8px", "type": "dimension" },
    "medium": { "value": "16px", "type": "dimension" },
    "large": { "value": "24px", "type": "dimension" }
  },
  "typography": {
    "body": {
      "fontFamily": { "value": ["Inter", "sans-serif"], "type": "fontFamily" },
      "fontSize": { "value": "16px", "type": "dimension" },
      "fontWeight": { "value": "400", "type": "fontWeight" }
    }
  }
}`,
            css: `:root {
  /* Colors */
  --color-primary-100: #e3f2fd;
  --color-primary-500: #2196f3;
  --color-primary-900: #0d47a1;
  
  /* Spacing */
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --spacing-large: 24px;
  
  /* Typography */
  --font-size-body: 16px;
  --font-weight-normal: 400;
}`,
            scss: `// Colors
$color-primary-100: #e3f2fd;
$color-primary-500: #2196f3;
$color-primary-900: #0d47a1;

// Spacing
$spacing-small: 8px;
$spacing-medium: 16px;
$spacing-large: 24px;

// Typography
$font-size-body: 16px;
$font-weight-normal: 400;`,
            figma: `{
  "global": {
    "color": {
      "primary": {
        "100": { "value": "#e3f2fd", "type": "color" },
        "500": { "value": "#2196f3", "type": "color" },
        "900": { "value": "#0d47a1", "type": "color" }
      }
    },
    "spacing": {
      "small": { "value": "8", "type": "spacing" },
      "medium": { "value": "16", "type": "spacing" },
      "large": { "value": "24", "type": "spacing" }
    }
  }
}`
        };
    }
    
    /**
     * Get example by name
     */
    get(name) {
        return this.examples[name] || null;
    }
    
    /**
     * Get all example names
     */
    getNames() {
        return Object.keys(this.examples);
    }
}

// Initialize the Design Token Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.designTokenManager = new DesignTokenManager();
    } catch (error) {
        console.error('Failed to initialize Design Token Manager:', error);
    }
});