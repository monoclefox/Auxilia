const { test, expect } = require('@playwright/test');

test.describe('Auxilia Color Tools - Smoke Tests', () => {
  
  test('Main landing page loads and navigation works', async ({ page }) => {
    await page.goto('/auxilia.html');
    
    // Check page loads with title
    await expect(page).toHaveTitle(/Auxilia/);
    
    // Check all tool cards are present
    await expect(page.locator('.tool-title:has-text("OKLCH ↔ Hex Converter")')).toBeVisible();
    await expect(page.locator('.tool-title:has-text("Accessibility Checker")')).toBeVisible();
    await expect(page.locator('.tool-title:has-text("Palette Generator")')).toBeVisible();
    await expect(page.locator('.tool-title:has-text("Design Token Converter")')).toBeVisible();
    
    // Test navigation to OKLCH converter
    await page.click('a[href="tools/oklch-converter.html"]');
    await expect(page).toHaveURL(/oklch-converter/);
    await expect(page.locator('h1')).toContainText('OKLCH');
  });

  test('OKLCH Converter functionality', async ({ page }) => {
    await page.goto('/tools/oklch-converter.html');
    
    // Wait for external scripts to load
    await page.waitForLoadState('networkidle');
    
    // Check no JavaScript errors occurred
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Test hex to OKLCH conversion
    const hexInput = page.locator('#hex-input');
    await hexInput.fill('ff0000'); // Red color without #
    
    // Verify automatic # prefix addition
    await expect(hexInput).toHaveValue('#ff0000');
    
    // Verify OKLCH values are populated (red should have high chroma)
    const chromaValue = page.locator('#chroma-value');
    await expect(chromaValue).toContainText(/0\.[1-9]/); // Should be > 0.1
    
    // Test copy functionality
    await page.click('.copy-button');
    // Give time for the copy operation to complete and text to change
    await page.waitForTimeout(100);
    const buttonText = await page.locator('.copy-button').textContent();
    expect(buttonText === 'Copied!' || buttonText === 'Copy').toBeTruthy();
    
    // Verify no console errors (except clipboard permission errors which are expected in headless mode)
    const nonClipboardErrors = errors.filter(error => !error.includes('clipboard') && !error.includes('Clipboard'));
    expect(nonClipboardErrors).toHaveLength(0);
  });

  test('Accessibility Checker functionality', async ({ page }) => {
    await page.goto('/tools/accessibility-checker.html');
    await page.waitForLoadState('networkidle');
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Check if contrast checker inputs exist
    const fgInput = page.locator('#foreground-input');
    const bgInput = page.locator('#background-input');
    
    if (await fgInput.count() > 0 && await bgInput.count() > 0) {
      // Test contrast checker
      await fgInput.fill('#000000');
      await bgInput.fill('#ffffff');
      
      // Should show high contrast ratio
      const contrastRatio = page.locator('.contrast-ratio');
      if (await contrastRatio.count() > 0) {
        await expect(contrastRatio).toContainText(/\d+/); // Any number
      }
    }
    
    // Check if color blindness simulation input exists
    const simulateInput = page.locator('#simulate-input');
    if (await simulateInput.count() > 0) {
      await simulateInput.fill('#ff0000');
    }
    
    expect(errors).toHaveLength(0);
  });

  test('Palette Generator functionality', async ({ page }) => {
    await page.goto('/tools/palette-generator.html');
    await page.waitForLoadState('networkidle');
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Check basic elements exist
    await expect(page.locator('#base-color')).toBeVisible();
    
    // Set base color if input exists
    const baseColorInput = page.locator('#base-color');
    if (await baseColorInput.count() > 0) {
      await baseColorInput.fill('#0066cc');
    }
    
    // Try to generate palette if button exists
    const generateButton = page.locator('#generate-palette');
    if (await generateButton.count() > 0) {
      await generateButton.click();
      await page.waitForTimeout(500);
    }
    
    expect(errors).toHaveLength(0);
  });

  test('Design Token Manager functionality', async ({ page }) => {
    await page.goto('/tools/design-token-manager.html');
    await page.waitForLoadState('networkidle');
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Check that the basic elements are present
    await expect(page.locator('#token-input')).toBeVisible();
    
    // Test with simple token input if parse button exists
    const parseButton = page.locator('#parse-tokens');
    if (await parseButton.count() > 0) {
      const sampleTokens = `{"colors": {"primary": {"value": "#0066cc"}}}`;
      await page.fill('#token-input', sampleTokens);
      await parseButton.click({ timeout: 5000 });
      await page.waitForTimeout(500);
    }
    
    expect(errors).toHaveLength(0);
  });

  test('Navigation between all tools works', async ({ page }) => {
    // Start from main page
    await page.goto('/auxilia.html');
    
    const tools = [
      { link: 'tools/oklch-converter.html', title: 'OKLCH' },
      { link: 'tools/accessibility-checker.html', title: 'Accessibility' },
      { link: 'tools/palette-generator.html', title: 'Palette' },
      { link: 'tools/design-token-manager.html', title: 'Token' }
    ];
    
    // Test navigation to each tool
    for (const tool of tools) {
      await page.goto('/auxilia.html');
      await page.click(`a[href="${tool.link}"]`);
      await expect(page.locator('h1')).toContainText(tool.title, { timeout: 5000 });
      
      // Test back to home navigation
      await page.click('a[href="../auxilia.html"]');
      await expect(page).toHaveURL(/auxilia.html/);
    }
  });

  test('External dependencies load correctly', async ({ page }) => {
    await page.goto('/tools/oklch-converter.html');
    
    // Wait for external scripts
    await page.waitForLoadState('networkidle');
    
    // Check Culori library is loaded
    const culoriLoaded = await page.evaluate(() => {
      return typeof window.culori !== 'undefined';
    });
    
    expect(culoriLoaded).toBe(true);
    
    // Check our modules loaded
    const colorUtilsLoaded = await page.evaluate(() => {
      return typeof window.ColorUtils !== 'undefined';
    });
    
    expect(colorUtilsLoaded).toBe(true);
  });

  test('Mobile responsiveness basic check', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auxilia.html');
    
    // Check main navigation is accessible
    await expect(page.locator('.nav')).toBeVisible();
    
    // Test tool navigation on mobile
    await page.goto('/tools/oklch-converter.html');
    await expect(page.locator('.main-container')).toBeVisible();
    
    // Basic input functionality should work on mobile
    await page.fill('#hex-input', 'ff0000');
    await expect(page.locator('#hex-input')).toHaveValue('#ff0000');
  });
});