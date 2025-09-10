# Auxilia

**Professional color tools for designers building accessible, beautiful products**

Auxilia is a comprehensive suite of color utilities designed with Swiss typography principles and modern web standards. Built for designers who care about accessibility, precision, and workflow efficiency.

## 🛠️ Tools

### 01 / OKLCH ↔ Hex Converter
Convert between OKLCH and hexadecimal color formats with real-time bidirectional conversion. Perfect for working with perceptually uniform color spaces.

**Features:**
- Real-time conversion between OKLCH and hex formats
- Automatic # prefix handling for hex input
- Precise decimal rounding (L/C: 3 decimals, H: 1 decimal)
- Live color preview
- Copy-to-clipboard functionality

### 02 / Accessibility Checker
Check WCAG contrast ratios and simulate color blindness. Ensure your color choices are accessible to all users.

**Features:**
- WCAG 2.1 contrast ratio testing
- AA/AAA compliance indicators
- Color blindness simulation
- Real-time accessibility feedback

### 03 / Palette Generator
Generate harmonious color palettes with mathematical precision. Create accessible color ramps for design systems.

**Features:**
- Algorithm-based palette generation
- Accessibility-focused color ramps
- Export capabilities
- Design system integration

### 04 / Design Token Converter
Convert design tokens between multiple formats. Perfect for multi-platform design systems.

**Features:**
- Multi-format token conversion
- Cross-platform compatibility
- Batch processing
- Design system workflow optimization

## 🎨 Design Philosophy

Auxilia follows **Swiss Design** (International Typographic Style) principles:

- **Typography**: Inter font family for authentic Swiss aesthetics
- **Grid System**: Mathematical precision in layout
- **Minimal Interface**: Focus on functionality over decoration
- **Accessibility First**: WCAG compliance built into every tool

## 🚀 Getting Started

### Quick Start
1. Clone this repository
2. Open `auxilia.html` in your browser
3. Navigate to any tool from the main interface

### Local Development
```bash
# Clone the repository
git clone https://github.com/monoclefox/Auxilia.git

# Navigate to project
cd Auxilia

# Serve locally (any HTTP server)
python -m http.server 8000
# or
npx serve .
```

## 📁 Project Structure

```
Auxilia/
├── README.md                    # Project documentation
├── auxilia.html                 # Main landing page
├── styles.css                   # Shared Swiss design system
├── oklch-converter.html         # OKLCH ↔ Hex converter tool
├── accessibility-checker.html   # WCAG accessibility checker
├── palette-generator.html       # Color palette generator
├── design-token-manager.html    # Design token converter
├── index.html                   # Simple redirect to auxilia.html
└── .gitignore                   # Git ignore patterns
```

## 🔧 Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Color Library**: [Culori](https://github.com/Evercoder/culori) for color space conversions
- **Typography**: [Inter](https://rsms.me/inter/) for Swiss design authenticity
- **Standards**: WCAG 2.1, modern CSS Grid/Flexbox

## 🎯 Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

This project welcomes contributions! Areas for improvement:

- Additional color space support
- Enhanced accessibility features
- Mobile-first responsive improvements
- Performance optimizations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💜 Credits

**Made for Jenn by Geoff**

Built with modern web technologies and Swiss design principles for designers who value precision, accessibility, and beautiful user experiences.

---

### Recent Updates

- ✨ Added automatic # prefix handling for hex input
- 🔧 Fixed OKLCH decimal precision formatting
- 📁 Added comprehensive .gitignore
- 🎨 Implemented Swiss typography with Inter font
- ♿ Enhanced accessibility compliance features