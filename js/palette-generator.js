/**
 * Palette Generator - Auxilia Suite
 * Generates harmonious color palettes and accessible color ramps using OKLCH color space
 * 
 * Dependencies:
 * - Culori library for color conversions
 * - ColorUtils for shared color utilities
 * - DOMHelpers for common DOM operations
 */

class PaletteGenerator {
    constructor() {
        // Global palette data
        this.currentPalette = [];
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Set up color harmony algorithms
        this.initializeHarmonyAlgorithms();
        
        // Set up export formats
        this.initializeExportFormats();
        
        // Bind event listeners
        this.bindEvents();
        
        // Generate initial palette
        this.generatePalette();
    }

    /**
     * Initialize DOM elements with error handling
     */
    initializeElements() {
        this.elements = {
            baseColorInput: DOMHelpers.getElement('base-color'),
            harmonySelect: DOMHelpers.getElement('harmony-type'),
            generateBtn: DOMHelpers.getElement('generate-btn'),
            palettesContainer: DOMHelpers.getElement('palettes-container'),
            exportTabs: document.querySelectorAll('.export-tab'),
            exportContent: DOMHelpers.getElement('export-content'),
            exportCode: DOMHelpers.getElement('export-code')
        };

        // Validate required elements
        const requiredElements = ['baseColorInput', 'harmonySelect', 'generateBtn', 'palettesContainer', 'exportCode'];
        requiredElements.forEach(elementKey => {
            if (!this.elements[elementKey]) {
                console.error(`Required element '${elementKey}' not found`);
            }
        });
    }

    /**
     * Initialize color harmony algorithms using OKLCH color space
     */
    initializeHarmonyAlgorithms() {
        this.harmonyAlgorithms = {
            monochromatic: (baseColor) => {
                const oklch = culori.oklch(baseColor);
                if (!oklch) return [];
                
                return [
                    { ...oklch, l: Math.max(0.1, oklch.l - 0.3) },
                    { ...oklch, l: Math.max(0.1, oklch.l - 0.15) },
                    oklch,
                    { ...oklch, l: Math.min(0.95, oklch.l + 0.15) },
                    { ...oklch, l: Math.min(0.95, oklch.l + 0.3) }
                ];
            },
            
            complementary: (baseColor) => {
                const oklch = culori.oklch(baseColor);
                if (!oklch) return [];
                
                return [
                    oklch,
                    { ...oklch, h: (oklch.h + 180) % 360 }
                ];
            },
            
            triadic: (baseColor) => {
                const oklch = culori.oklch(baseColor);
                if (!oklch) return [];
                
                return [
                    oklch,
                    { ...oklch, h: (oklch.h + 120) % 360 },
                    { ...oklch, h: (oklch.h + 240) % 360 }
                ];
            },
            
            tetradic: (baseColor) => {
                const oklch = culori.oklch(baseColor);
                if (!oklch) return [];
                
                return [
                    oklch,
                    { ...oklch, h: (oklch.h + 90) % 360 },
                    { ...oklch, h: (oklch.h + 180) % 360 },
                    { ...oklch, h: (oklch.h + 270) % 360 }
                ];
            },
            
            analogous: (baseColor) => {
                const oklch = culori.oklch(baseColor);
                if (!oklch) return [];
                
                return [
                    { ...oklch, h: (oklch.h - 30 + 360) % 360 },
                    { ...oklch, h: (oklch.h - 15 + 360) % 360 },
                    oklch,
                    { ...oklch, h: (oklch.h + 15) % 360 },
                    { ...oklch, h: (oklch.h + 30) % 360 }
                ];
            },
            
            'split-complementary': (baseColor) => {
                const oklch = culori.oklch(baseColor);
                if (!oklch) return [];
                
                return [
                    oklch,
                    { ...oklch, h: (oklch.h + 150) % 360 },
                    { ...oklch, h: (oklch.h + 210) % 360 }
                ];
            }
        };
    }

    /**
     * Initialize export format generators
     */
    initializeExportFormats() {
        this.exportFormats = {
            css: () => {
                let css = ':root {\n';
                this.currentPalette.forEach((colorData, colorIndex) => {
                    colorData.ramp.forEach(rampColor => {
                        css += `  --color-${colorIndex + 1}-${rampColor.step}: ${rampColor.hex};\n`;
                    });
                });
                css += '}';
                return css;
            },
            
            json: () => {
                const tokens = {};
                this.currentPalette.forEach((colorData, colorIndex) => {
                    tokens[`color-${colorIndex + 1}`] = {};
                    colorData.ramp.forEach(rampColor => {
                        tokens[`color-${colorIndex + 1}`][rampColor.step] = {
                            value: rampColor.hex,
                            type: 'color'
                        };
                    });
                });
                return JSON.stringify(tokens, null, 2);
            },
            
            tailwind: () => {
                let config = 'module.exports = {\n  theme: {\n    colors: {\n';
                this.currentPalette.forEach((colorData, colorIndex) => {
                    config += `      'custom-${colorIndex + 1}': {\n`;
                    colorData.ramp.forEach(rampColor => {
                        config += `        ${rampColor.step}: '${rampColor.hex}',\n`;
                    });
                    config += '      },\n';
                });
                config += '    }\n  }\n}';
                return config;
            },
            
            figma: () => {
                const figmaTokens = {};
                this.currentPalette.forEach((colorData, colorIndex) => {
                    colorData.ramp.forEach(rampColor => {
                        figmaTokens[`color-${colorIndex + 1}-${rampColor.step}`] = {
                            value: rampColor.hex,
                            type: 'color',
                            description: `Color ${colorIndex + 1} - Step ${rampColor.step}`
                        };
                    });
                });
                return JSON.stringify(figmaTokens, null, 2);
            }
        };
    }

    /**
     * Generate accessible color ramp from base color
     * Uses OKLCH for perceptual uniformity
     */
    generateColorRamp(baseColor) {
        try {
            const oklch = culori.oklch(baseColor);
            if (!oklch) {
                console.error('Invalid color for ramp generation:', baseColor);
                return [];
            }

            const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
            
            return steps.map(step => {
                const lightness = 1 - (step - 50) / 900; // Scale from ~0.95 to ~0.05
                const adjustedLightness = Math.max(0.05, Math.min(0.95, lightness));
                
                // Adjust chroma for very light and very dark colors to maintain color integrity
                let adjustedChroma = oklch.c || 0;
                if (adjustedLightness > 0.8) {
                    adjustedChroma *= (0.8 / adjustedLightness) * 0.7;
                } else if (adjustedLightness < 0.2) {
                    adjustedChroma *= (adjustedLightness / 0.2) * 0.8;
                }
                
                const rampColor = { ...oklch, l: adjustedLightness, c: adjustedChroma };
                
                return {
                    step,
                    color: rampColor,
                    hex: culori.formatHex(rampColor)
                };
            });
        } catch (error) {
            console.error('Error generating color ramp:', error);
            return [];
        }
    }

    /**
     * Validate color input using ColorUtils
     */
    validateColor(colorInput) {
        try {
            // Try to parse with ColorUtils first
            const colorData = ColorUtils.hexToOklch(colorInput);
            if (colorData) {
                return { valid: true, hex: colorData.hex };
            }

            // Fallback to direct culori parsing for other formats (hsl, rgb, etc.)
            const testColor = culori.oklch(colorInput);
            if (testColor && typeof testColor.l === 'number') {
                return { valid: true, hex: culori.formatHex(testColor) };
            }
        } catch (error) {
            console.warn('Color validation failed:', error);
        }
        
        return { valid: false, message: 'Please enter a valid color (hex, hsl, rgb, etc.)' };
    }

    /**
     * Generate complete palette with harmony colors and ramps
     */
    generatePalette() {
        if (!this.elements.baseColorInput || !this.elements.harmonySelect) {
            console.error('Required elements not available for palette generation');
            return;
        }

        const baseColor = this.elements.baseColorInput.value.trim();
        const harmonyType = this.elements.harmonySelect.value;
        
        // Validate color input
        const validation = this.validateColor(baseColor);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        try {
            const harmonyColors = this.harmonyAlgorithms[harmonyType](baseColor);
            if (!harmonyColors.length) {
                throw new Error('Failed to generate harmony colors');
            }

            this.currentPalette = harmonyColors.map(color => ({
                hex: culori.formatHex(color),
                oklch: color,
                ramp: this.generateColorRamp(culori.formatHex(color))
            }));
            
            this.renderPalettes();
            this.updateExport();
        } catch (error) {
            console.error('Error generating palette:', error);
            alert('Failed to generate palette. Please try a different color.');
        }
    }

    /**
     * Render palettes to DOM with proper structure
     */
    renderPalettes() {
        if (!this.elements.palettesContainer || !this.elements.harmonySelect) {
            console.error('Required elements not available for rendering');
            return;
        }

        const harmonyType = this.elements.harmonySelect.value;
        const typeNames = {
            'monochromatic': 'Monochromatic Variations',
            'complementary': 'Complementary Colors', 
            'triadic': 'Triadic Harmony',
            'tetradic': 'Tetradic (Square)',
            'analogous': 'Analogous Colors',
            'split-complementary': 'Split Complementary'
        };
        
        let html = `
            <div class="palette-card">
                <div class="palette-title">
                    ${typeNames[harmonyType] || 'Color Harmony'}
                    <button class="copy-palette-btn" data-copy-type="harmony">Copy Colors</button>
                </div>
                <div class="color-harmony-row">
        `;
        
        // Render harmony colors
        this.currentPalette.forEach((colorData, index) => {
            html += `
                <div class="color-swatch" 
                     style="background-color: ${colorData.hex}"
                     data-color="${colorData.hex}"
                     title="Click to copy ${colorData.hex}">
                    ${colorData.hex}
                </div>
            `;
        });
        
        html += `</div></div>`;
        
        // Render color ramps for each harmony color
        this.currentPalette.forEach((colorData, index) => {
            html += `
                <div class="palette-card">
                    <div class="palette-title">
                        Color Ramp ${index + 1}
                        <button class="copy-palette-btn" data-copy-type="ramp" data-ramp-index="${index}">Copy Ramp</button>
                    </div>
                    <div class="color-ramp">
            `;
            
            colorData.ramp.forEach(rampColor => {
                const textColor = rampColor.color.l > 0.5 ? '#000' : '#fff';
                html += `
                    <div>
                        <div class="ramp-swatch" 
                             style="background-color: ${rampColor.hex}; color: ${textColor}"
                             data-color="${rampColor.hex}"
                             title="Click to copy ${rampColor.hex}">
                            ${rampColor.step}
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });
        
        this.elements.palettesContainer.innerHTML = html;

        // Bind click events for color swatches and copy buttons
        this.bindPaletteEvents();
    }

    /**
     * Bind events for palette interactions
     */
    bindPaletteEvents() {
        if (!this.elements.palettesContainer) return;

        // Color swatch copy events
        const colorSwatches = this.elements.palettesContainer.querySelectorAll('[data-color]');
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                if (color) {
                    DOMHelpers.copyToClipboard(color, e.currentTarget);
                }
            });
        });

        // Palette copy button events
        const copyButtons = this.elements.palettesContainer.querySelectorAll('[data-copy-type]');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePaletteCopy(e.currentTarget);
            });
        });
    }

    /**
     * Handle palette copy operations
     */
    handlePaletteCopy(button) {
        const copyType = button.dataset.copyType;
        let textToCopy = '';
        
        try {
            if (copyType === 'harmony') {
                textToCopy = this.currentPalette.map(c => c.hex).join(', ');
            } else if (copyType === 'ramp') {
                const index = parseInt(button.dataset.rampIndex);
                if (index >= 0 && index < this.currentPalette.length) {
                    textToCopy = this.currentPalette[index].ramp.map(r => r.hex).join(', ');
                }
            }
            
            if (textToCopy) {
                DOMHelpers.copyToClipboard(textToCopy, button);
            }
        } catch (error) {
            console.error('Error copying palette:', error);
        }
    }

    /**
     * Update export content based on active tab
     */
    updateExport() {
        if (!this.elements.exportCode || this.currentPalette.length === 0) return;

        const activeTab = document.querySelector('.export-tab.active');
        if (activeTab) {
            const format = activeTab.dataset.format;
            const formatter = this.exportFormats[format];
            
            if (formatter) {
                try {
                    this.elements.exportCode.textContent = formatter();
                } catch (error) {
                    console.error('Error generating export:', error);
                    this.elements.exportCode.textContent = '/* Error generating export format */';
                }
            }
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        if (!this.elements.generateBtn) return;

        // Generation events
        this.elements.generateBtn.addEventListener('click', () => this.generatePalette());
        
        if (this.elements.baseColorInput) {
            this.elements.baseColorInput.addEventListener('change', () => this.generatePalette());
        }
        
        if (this.elements.harmonySelect) {
            this.elements.harmonySelect.addEventListener('change', () => this.generatePalette());
        }
        
        // Export tab switching
        this.elements.exportTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.elements.exportTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateExport();
            });
        });
        
        // Copy export content
        if (this.elements.exportContent) {
            this.elements.exportContent.addEventListener('click', () => {
                const content = this.elements.exportCode?.textContent;
                if (content) {
                    DOMHelpers.copyToClipboard(content, this.elements.exportContent);
                }
            });
        }
    }

    /**
     * Get current palette data (for external access)
     */
    getCurrentPalette() {
        return this.currentPalette;
    }

    /**
     * Set base color programmatically
     */
    setBaseColor(color) {
        if (this.elements.baseColorInput) {
            this.elements.baseColorInput.value = color;
            this.generatePalette();
        }
    }

    /**
     * Set harmony type programmatically
     */
    setHarmonyType(harmonyType) {
        if (this.elements.harmonySelect && this.harmonyAlgorithms[harmonyType]) {
            this.elements.harmonySelect.value = harmonyType;
            this.generatePalette();
        }
    }
}

// Initialize the palette generator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Ensure required dependencies are available
    if (typeof culori === 'undefined') {
        console.error('Culori library is required but not loaded');
        return;
    }
    
    if (typeof ColorUtils === 'undefined') {
        console.error('ColorUtils is required but not loaded');
        return;
    }
    
    if (typeof DOMHelpers === 'undefined') {
        console.error('DOMHelpers is required but not loaded');
        return;
    }
    
    // Initialize the palette generator
    window.paletteGenerator = new PaletteGenerator();
});