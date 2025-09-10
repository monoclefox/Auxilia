/**
 * DOM helper utilities
 * Common functions used across Auxilia tools
 */

const DOMHelpers = {
    /**
     * Sync input and range elements with value display
     */
    syncInputs(input, range, valueSpan, decimals = 3) {
        input.addEventListener('input', () => {
            range.value = input.value;
            valueSpan.textContent = parseFloat(input.value).toFixed(decimals);
        });

        range.addEventListener('input', () => {
            input.value = range.value;
            valueSpan.textContent = parseFloat(range.value).toFixed(decimals);
        });
    },

    /**
     * Copy text to clipboard with visual feedback
     */
    async copyToClipboard(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 1000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    },

    /**
     * Get element by ID with error handling
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with ID '${id}' not found`);
        }
        return element;
    },

    /**
     * Set up common event listeners for tools
     */
    setupToolEvents() {
        // Add any common event listeners here
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Auxilia tool initialized');
        });
    }
};

// Make DOMHelpers available globally
window.DOMHelpers = DOMHelpers;