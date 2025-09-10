/**
 * Accessibility Checker Module
 * WCAG contrast ratio checking and color blindness simulation
 * Part of the Auxilia Design Suite
 */

class AccessibilityChecker {
    constructor() {
        this.elements = {};
        this.colorBlindMatrices = {
            protanopia: [
                [0.567, 0.433, 0],
                [0.558, 0.442, 0],
                [0, 0.242, 0.758]
            ],
            deuteranopia: [
                [0.625, 0.375, 0],
                [0.7, 0.3, 0],
                [0, 0.3, 0.7]
            ],
            tritanopia: [
                [0.95, 0.05, 0],
                [0, 0.433, 0.567],
                [0, 0.475, 0.525]
            ]
        };
        
        this.init();
    }

    /**
     * Initialize the accessibility checker
     */
    init() {
        try {
            this.getElements();
            this.setupEventListeners();
            this.performInitialUpdates();
        } catch (error) {
            console.error('Failed to initialize Accessibility Checker:', error);
        }
    }

    /**
     * Get all required DOM elements
     */
    getElements() {
        // Input elements
        this.elements.foregroundInput = DOMHelpers.getElement('foreground-color');
        this.elements.backgroundInput = DOMHelpers.getElement('background-color');
        this.elements.simulateInput = DOMHelpers.getElement('simulate-color');
        
        // Swatch elements
        this.elements.foregroundSwatch = DOMHelpers.getElement('foreground-swatch');
        this.elements.backgroundSwatch = DOMHelpers.getElement('background-swatch');
        this.elements.simulateSwatch = DOMHelpers.getElement('simulate-swatch');
        
        // Contrast result elements
        this.elements.contrastRatio = DOMHelpers.getElement('contrast-ratio');
        this.elements.textPreview = DOMHelpers.getElement('text-preview');
        
        // WCAG badge elements
        this.elements.aaNormal = DOMHelpers.getElement('aa-normal');
        this.elements.aaLarge = DOMHelpers.getElement('aa-large');
        this.elements.aaaNormal = DOMHelpers.getElement('aaa-normal');
        this.elements.aaaLarge = DOMHelpers.getElement('aaa-large');
        
        // Color blindness simulation swatches
        this.elements.originalSwatch = DOMHelpers.getElement('original-swatch');
        this.elements.protanopiaSwatch = DOMHelpers.getElement('protanopia-swatch');
        this.elements.deuteranopiaSwatch = DOMHelpers.getElement('deuteranopia-swatch');
        this.elements.tritanopiaSwatch = DOMHelpers.getElement('tritanopia-swatch');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (this.elements.foregroundInput) {
            this.elements.foregroundInput.addEventListener('input', () => this.updateContrastChecker());
        }
        
        if (this.elements.backgroundInput) {
            this.elements.backgroundInput.addEventListener('input', () => this.updateContrastChecker());
        }
        
        if (this.elements.simulateInput) {
            this.elements.simulateInput.addEventListener('input', () => this.updateColorBlindnessSimulation());
        }
    }

    /**
     * Perform initial updates on page load
     */
    performInitialUpdates() {
        this.updateContrastChecker();
        this.updateColorBlindnessSimulation();
    }

    /**
     * Calculate WCAG contrast ratio between two colors
     * @param {string} color1 - First color (any format supported by Culori)
     * @param {string} color2 - Second color (any format supported by Culori)
     * @returns {number|null} - Contrast ratio or null if calculation fails
     */
    calculateContrastRatio(color1, color2) {
        try {
            const rgb1 = culori.rgb(color1);
            const rgb2 = culori.rgb(color2);
            
            if (!rgb1 || !rgb2) {
                console.warn('Invalid colors provided for contrast calculation:', color1, color2);
                return null;
            }
            
            const l1 = this.getRelativeLuminance(rgb1);
            const l2 = this.getRelativeLuminance(rgb2);
            
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            
            return (lighter + 0.05) / (darker + 0.05);
        } catch (error) {
            console.error('Error calculating contrast ratio:', error);
            return null;
        }
    }

    /**
     * Calculate relative luminance according to WCAG standards
     * @param {object} rgb - RGB color object {r, g, b} with values 0-1
     * @returns {number} - Relative luminance value
     */
    getRelativeLuminance(rgb) {
        const { r, g, b } = rgb;
        
        const srgb = [r, g, b].map(c => {
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    }

    /**
     * Update a WCAG compliance badge
     * @param {HTMLElement} element - Badge element to update
     * @param {boolean} passes - Whether the test passes
     * @param {string} label - Badge label text
     */
    updateBadge(element, passes, label) {
        if (!element) return;
        
        element.textContent = label;
        element.className = `badge ${passes ? 'badge-pass' : 'badge-fail'}`;
    }

    /**
     * Update the contrast checker section
     */
    updateContrastChecker() {
        if (!this.elements.foregroundInput || !this.elements.backgroundInput) return;
        
        const fg = this.elements.foregroundInput.value.trim();
        const bg = this.elements.backgroundInput.value.trim();
        
        // Update color swatches
        if (this.elements.foregroundSwatch) {
            this.elements.foregroundSwatch.style.backgroundColor = fg;
        }
        if (this.elements.backgroundSwatch) {
            this.elements.backgroundSwatch.style.backgroundColor = bg;
        }
        
        // Calculate and display contrast ratio
        const ratio = this.calculateContrastRatio(fg, bg);
        
        if (ratio && this.elements.contrastRatio) {
            this.elements.contrastRatio.textContent = ratio.toFixed(2);
            
            // Update WCAG compliance badges
            this.updateBadge(this.elements.aaNormal, ratio >= 4.5, 'AA Normal');
            this.updateBadge(this.elements.aaLarge, ratio >= 3.0, 'AA Large');
            this.updateBadge(this.elements.aaaNormal, ratio >= 7.0, 'AAA Normal');
            this.updateBadge(this.elements.aaaLarge, ratio >= 4.5, 'AAA Large');
            
            // Update text preview with actual colors
            if (this.elements.textPreview) {
                this.elements.textPreview.style.setProperty('--bg-color', bg);
                this.elements.textPreview.style.setProperty('--text-color', fg);
            }
        } else {
            // Handle invalid colors
            if (this.elements.contrastRatio) {
                this.elements.contrastRatio.textContent = '—';
            }
            
            this.updateBadge(this.elements.aaNormal, false, 'AA Normal');
            this.updateBadge(this.elements.aaLarge, false, 'AA Large');
            this.updateBadge(this.elements.aaaNormal, false, 'AAA Normal');
            this.updateBadge(this.elements.aaaLarge, false, 'AAA Large');
        }
    }

    /**
     * Simulate color blindness using transformation matrices
     * @param {string} color - Input color (any format supported by Culori)
     * @param {string} type - Type of color blindness (protanopia, deuteranopia, tritanopia)
     * @returns {string} - Simulated color in hex format
     */
    simulateColorBlindness(color, type) {
        try {
            const rgb = culori.rgb(color);
            if (!rgb) {
                console.warn('Invalid color for color blindness simulation:', color);
                return color;
            }
            
            const matrix = this.colorBlindMatrices[type];
            if (!matrix) {
                console.error('Unknown color blindness type:', type);
                return color;
            }
            
            // Apply transformation matrix
            const r = rgb.r * matrix[0][0] + rgb.g * matrix[0][1] + rgb.b * matrix[0][2];
            const g = rgb.r * matrix[1][0] + rgb.g * matrix[1][1] + rgb.b * matrix[1][2];
            const b = rgb.r * matrix[2][0] + rgb.g * matrix[2][1] + rgb.b * matrix[2][2];
            
            // Clamp values to valid range and return hex
            return culori.formatHex({
                mode: 'rgb',
                r: Math.max(0, Math.min(1, r)),
                g: Math.max(0, Math.min(1, g)),
                b: Math.max(0, Math.min(1, b))
            });
        } catch (error) {
            console.error('Error simulating color blindness:', error);
            return color;
        }
    }

    /**
     * Update the color blindness simulation section
     */
    updateColorBlindnessSimulation() {
        if (!this.elements.simulateInput) return;
        
        const color = this.elements.simulateInput.value.trim();
        
        // Update input swatch
        if (this.elements.simulateSwatch) {
            this.elements.simulateSwatch.style.backgroundColor = color;
        }
        
        // Update original swatch
        if (this.elements.originalSwatch) {
            this.elements.originalSwatch.style.backgroundColor = color;
        }
        
        // Update color blindness simulation swatches
        if (this.elements.protanopiaSwatch) {
            this.elements.protanopiaSwatch.style.backgroundColor = 
                this.simulateColorBlindness(color, 'protanopia');
        }
        
        if (this.elements.deuteranopiaSwatch) {
            this.elements.deuteranopiaSwatch.style.backgroundColor = 
                this.simulateColorBlindness(color, 'deuteranopia');
        }
        
        if (this.elements.tritanopiaSwatch) {
            this.elements.tritanopiaSwatch.style.backgroundColor = 
                this.simulateColorBlindness(color, 'tritanopia');
        }
    }

    /**
     * Get current contrast ratio
     * @returns {number|null} Current contrast ratio or null
     */
    getCurrentContrastRatio() {
        if (!this.elements.foregroundInput || !this.elements.backgroundInput) return null;
        
        return this.calculateContrastRatio(
            this.elements.foregroundInput.value.trim(),
            this.elements.backgroundInput.value.trim()
        );
    }

    /**
     * Check if current colors meet WCAG standards
     * @param {string} level - WCAG level ('AA' or 'AAA')
     * @param {string} size - Text size ('normal' or 'large')
     * @returns {boolean} Whether colors meet the standard
     */
    meetsWCAGStandard(level = 'AA', size = 'normal') {
        const ratio = this.getCurrentContrastRatio();
        if (!ratio) return false;
        
        const thresholds = {
            'AA': { normal: 4.5, large: 3.0 },
            'AAA': { normal: 7.0, large: 4.5 }
        };
        
        return ratio >= thresholds[level][size];
    }

    /**
     * Set colors programmatically
     * @param {string} foreground - Foreground color
     * @param {string} background - Background color
     */
    setColors(foreground, background) {
        if (this.elements.foregroundInput && foreground) {
            this.elements.foregroundInput.value = foreground;
        }
        if (this.elements.backgroundInput && background) {
            this.elements.backgroundInput.value = background;
        }
        this.updateContrastChecker();
    }

    /**
     * Set simulation color programmatically
     * @param {string} color - Color to simulate
     */
    setSimulationColor(color) {
        if (this.elements.simulateInput && color) {
            this.elements.simulateInput.value = color;
            this.updateColorBlindnessSimulation();
        }
    }
}

// Initialize the accessibility checker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure required dependencies are available
    if (typeof culori === 'undefined') {
        console.error('Culori library is required for Accessibility Checker');
        return;
    }
    
    if (typeof DOMHelpers === 'undefined') {
        console.error('DOMHelpers utility is required for Accessibility Checker');
        return;
    }
    
    // Initialize the accessibility checker
    window.accessibilityChecker = new AccessibilityChecker();
    console.log('Accessibility Checker initialized successfully');
});