/**
 * OKLCH Converter Tool
 * Converts between OKLCH and hexadecimal color formats
 */

class OKLCHConverter {
    constructor() {
        this.initializeElements();
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
    }
}

// Global function for copy button (called from HTML)
function copyHex() {
    const hexInput = document.getElementById('hex-input');
    const button = document.querySelector('.copy-button');
    DOMHelpers.copyToClipboard(hexInput.value, button);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OKLCHConverter();
});