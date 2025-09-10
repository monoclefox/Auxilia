/**
 * OKLCH Converter Tool
 * Converts between OKLCH and hexadecimal color formats
 */

class ColorHistory {
    constructor() {
        this.storageKey = 'oklch-color-history';
        this.maxItems = 20;
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load color history:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            console.warn('Failed to save color history:', error);
        }
    }

    addColor(hex, l, c, h) {
        // Remove existing entry with same hex (avoid duplicates)
        this.history = this.history.filter(item => item.hex.toLowerCase() !== hex.toLowerCase());
        
        // Add new entry at the beginning
        this.history.unshift({
            hex: hex.toLowerCase(),
            l: parseFloat(l.toFixed(3)),
            c: parseFloat(c.toFixed(3)), 
            h: parseFloat(h.toFixed(1)),
            timestamp: Date.now()
        });

        // Keep only maxItems
        if (this.history.length > this.maxItems) {
            this.history = this.history.slice(0, this.maxItems);
        }

        this.saveHistory();
        this.renderHistory();
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    No colors saved yet. Enter or paste colors to see them here.
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-hex="${item.hex}" data-l="${item.l}" data-c="${item.c}" data-h="${item.h}">
                <div class="history-swatch" style="background-color: ${item.hex}"></div>
                <div class="history-hex">${item.hex}</div>
                <div class="history-oklch">L: ${item.l}, C: ${item.c}, H: ${item.h}°</div>
                <div class="history-time">${this.formatRelativeTime(item.timestamp)}</div>
            </div>
        `).join('');

        // Add click handlers to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const hex = e.currentTarget.dataset.hex;
                const l = parseFloat(e.currentTarget.dataset.l);
                const c = parseFloat(e.currentTarget.dataset.c);
                const h = parseFloat(e.currentTarget.dataset.h);
                
                // Apply color to converter
                if (window.oklchConverter) {
                    window.oklchConverter.applyColor(hex, l, c, h);
                }
            });
        });
    }
}

class OKLCHConverter {
    constructor() {
        this.initializeElements();
        this.initializeHistory();
        this.setupEventListeners();
        this.convertColor(); // Initial conversion
    }

    initializeElements() {
        this.lightnessInput = DOMHelpers.getElement('lightness');
        this.lightnessRange = DOMHelpers.getElement('lightness-range');
        this.lightnessValue = DOMHelpers.getElement('lightness-value');
        
        this.chromaInput = DOMHelpers.getElement('chroma');
        this.chromaRange = DOMHelpers.getElement('chroma-range');
        this.chromaValue = DOMHelpers.getElement('chroma-value');
        
        this.hueInput = DOMHelpers.getElement('hue');
        this.hueRange = DOMHelpers.getElement('hue-range');
        this.hueValue = DOMHelpers.getElement('hue-value');
        
        this.colorPreview = DOMHelpers.getElement('color-preview');
        this.hexInput = DOMHelpers.getElement('hex-input');
    }

    initializeHistory() {
        this.colorHistory = new ColorHistory();
        
        // Set up clear history button
        const clearButton = document.getElementById('clear-history');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.colorHistory.clearHistory();
            });
        }
        
        // Initial render of history
        this.colorHistory.renderHistory();
    }

    setupEventListeners() {
        // Sync inputs with ranges and trigger conversions
        this.syncInputsWithConversion(this.lightnessInput, this.lightnessRange, this.lightnessValue, 3);
        this.syncInputsWithConversion(this.chromaInput, this.chromaRange, this.chromaValue, 3);
        this.syncInputsWithConversion(this.hueInput, this.hueRange, this.hueValue, 1);

        // Hex input conversion
        this.hexInput.addEventListener('input', () => this.convertFromHex());
    }

    syncInputsWithConversion(input, range, valueSpan, decimals = 3) {
        input.addEventListener('input', () => {
            range.value = input.value;
            valueSpan.textContent = parseFloat(input.value).toFixed(decimals);
            this.convertColor();
        });

        range.addEventListener('input', () => {
            input.value = range.value;
            valueSpan.textContent = parseFloat(range.value).toFixed(decimals);
            this.convertColor();
        });
    }

    convertColor() {
        const l = parseFloat(this.lightnessInput.value);
        const c = parseFloat(this.chromaInput.value);
        const h = parseFloat(this.hueInput.value);

        // Convert to hex using shared utility
        const hexColor = ColorUtils.oklchToHex(l, c, h);
        
        // Update outputs
        this.hexInput.value = hexColor;
        this.colorPreview.style.backgroundColor = hexColor;
        
        // Save to history when values change via sliders/inputs
        this.saveCurrentColor();
    }

    saveCurrentColor() {
        const l = parseFloat(this.lightnessInput.value);
        const c = parseFloat(this.chromaInput.value);
        const h = parseFloat(this.hueInput.value);
        const hex = this.hexInput.value;
        
        if (hex && hex !== '#000000' && hex !== '#b8a9db') { // Don't save default colors
            this.colorHistory.addColor(hex, l, c, h);
        }
    }

    convertFromHex() {
        const hexValue = this.hexInput.value;
        const result = ColorUtils.hexToOklch(hexValue);
        
        if (!result) {
            return; // Invalid hex format
        }

        // Update input field with normalized hex
        this.hexInput.value = result.hex;

        // Clamp values to valid ranges
        const clamped = ColorUtils.clampOklch(result.l, result.c, result.h);

        // Update inputs with proper rounding
        this.lightnessInput.value = result.l;
        this.lightnessRange.value = result.l;
        this.lightnessValue.textContent = result.l.toFixed(3);

        this.chromaInput.value = result.c;
        this.chromaRange.value = result.c;
        this.chromaValue.textContent = result.c.toFixed(3);

        this.hueInput.value = result.h;
        this.hueRange.value = result.h;
        this.hueValue.textContent = result.h.toFixed(1);

        // Update color preview
        this.colorPreview.style.backgroundColor = result.hex;
        
        // Save to history when hex is pasted/entered
        this.colorHistory.addColor(result.hex, result.l, result.c, result.h);
    }

    applyColor(hex, l, c, h) {
        // Update all inputs without triggering history save
        this.lightnessInput.value = l;
        this.lightnessRange.value = l;
        this.lightnessValue.textContent = l.toFixed(3);

        this.chromaInput.value = c;
        this.chromaRange.value = c;
        this.chromaValue.textContent = c.toFixed(3);

        this.hueInput.value = h;
        this.hueRange.value = h;
        this.hueValue.textContent = h.toFixed(1);

        this.hexInput.value = hex;
        this.colorPreview.style.backgroundColor = hex;
    }
}

// Global function for copy button (called from HTML)
function copyHex() {
    const hexInput = document.getElementById('hex-input');
    const button = document.querySelector('.copy-button');
    DOMHelpers.copyToClipboard(hexInput.value, button);
    
    // Save copied color to history
    if (window.oklchConverter) {
        window.oklchConverter.saveCurrentColor();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.oklchConverter = new OKLCHConverter();
});