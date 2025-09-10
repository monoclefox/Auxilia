/**
 * Shared color utility functions
 * Used across multiple Auxilia tools
 */

// Color conversion utilities using Culori library
const ColorUtils = {
    /**
     * Convert OKLCH to hex with proper rounding
     */
    oklchToHex(l, c, h) {
        const oklchColor = {
            mode: 'oklch',
            l: l,
            c: c,
            h: h
        };
        return culori.formatHex(oklchColor);
    },

    /**
     * Convert hex to OKLCH with validation and rounding
     */
    hexToOklch(hexValue) {
        // Auto-handle # prefix
        let normalizedHex = hexValue.trim();
        if (normalizedHex && !normalizedHex.startsWith('#')) {
            normalizedHex = '#' + normalizedHex;
        }
        
        // Validate hex format
        if (!/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/.test(normalizedHex)) {
            return null;
        }

        try {
            const oklchColor = culori.oklch(normalizedHex);
            if (oklchColor && typeof oklchColor.l === 'number') {
                return {
                    l: Math.round((oklchColor.l || 0) * 1000) / 1000,
                    c: Math.round((oklchColor.c || 0) * 1000) / 1000,
                    h: Math.round((oklchColor.h || 0) * 10) / 10,
                    hex: normalizedHex
                };
            }
        } catch (error) {
            console.warn('Invalid color:', normalizedHex);
        }
        
        return null;
    },

    /**
     * Clamp values to valid ranges
     */
    clampOklch(l, c, h) {
        return {
            l: Math.max(0, Math.min(1, l || 0)),
            c: Math.max(0, Math.min(0.4, c || 0)),
            h: isNaN(h) ? 0 : (h || 0) % 360
        };
    }
};

// Make ColorUtils available globally
window.ColorUtils = ColorUtils;