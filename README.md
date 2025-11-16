# LaTeX Equation Fixer - Chrome Extension

A Chrome extension that automatically converts pasted LaTeX equations to properly formatted mathematical symbols in Google Docs and Microsoft Word Online.

## Problem It Solves

When you copy and paste mathematical content from sources that use LaTeX formatting, you often end up with raw LaTeX code like:

```
$S = n(n+1) / 2$
$\alpha + \beta \ge \gamma$
```

This extension automatically converts these to readable mathematical notation:
- `S = n(n+1) / 2`
- `α + β ≥ γ`

## Features

- **Auto-conversion on paste**: Automatically detects and converts LaTeX when you paste into Google Docs or Word Online
- **Manual conversion tool**: Popup interface for converting LaTeX text before pasting
- **Floating button**: In-page button to convert selected text
- **Comprehensive symbol support**: Supports Greek letters, mathematical operators, subscripts, superscripts, and more

## Installation

### Method 1: Load Unpacked Extension (for development/personal use)

1. **Download or clone this repository**

2. **Open Chrome and navigate to extensions**:
   - Go to `chrome://extensions/`
   - Or click the three dots menu → More tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the extension**:
   - Click "Load unpacked"
   - Navigate to the `equationext` folder and select it

5. **The extension is now installed!**
   - You should see the Σ (Sigma) icon in your Chrome toolbar

## Usage

### Automatic Conversion (Easiest)

1. Go to Google Docs or Microsoft Word Online
2. Copy text containing LaTeX equations (with `$` delimiters)
3. Paste into the document
4. The extension automatically converts LaTeX to readable math symbols
5. A notification will confirm the conversion

### Manual Conversion via Popup

1. Click the Σ icon in your Chrome toolbar
2. Paste your LaTeX text in the input box
3. Click "Convert LaTeX" (or wait for auto-conversion)
4. Copy the converted text from the output box
5. Paste it into your document

### Convert Selected Text

1. In Google Docs or Word Online, select text containing LaTeX
2. Click the "🔄 Convert LaTeX" button (bottom right of page)
3. The selected text will be converted in place

## Supported LaTeX Commands

### Greek Letters
- `\alpha` → α, `\beta` → β, `\gamma` → γ, `\delta` → δ
- `\epsilon` → ε, `\theta` → θ, `\lambda` → λ, `\mu` → μ
- `\pi` → π, `\sigma` → σ, `\phi` → φ, `\omega` → ω
- And all uppercase: `\Delta` → Δ, `\Sigma` → Σ, `\Omega` → Ω, etc.

### Mathematical Operators
- `\times` → ×, `\div` → ÷
- `\pm` → ±, `\mp` → ∓
- `\cdot` → ·

### Relational Operators
- `\le` or `\leq` → ≤
- `\ge` or `\geq` → ≥
- `\ne` or `\neq` → ≠
- `\approx` → ≈
- `\equiv` → ≡

### Set Theory
- `\in` → ∈, `\notin` → ∉
- `\subset` → ⊂, `\supset` → ⊃
- `\cup` → ∪, `\cap` → ∩
- `\emptyset` → ∅

### Logic
- `\forall` → ∀, `\exists` → ∃
- `\neg` → ¬, `\land` → ∧, `\lor` → ∨
- `\implies` → ⇒, `\iff` → ⇔

### Arrows
- `\rightarrow` → →, `\leftarrow` → ←
- `\Rightarrow` → ⇒, `\Leftarrow` → ⇐

### Special Symbols
- `\infty` → ∞
- `\sum` → ∑
- `\int` → ∫
- `\partial` → ∂
- `\nabla` → ∇

### Superscripts and Subscripts
- `$x^2$` → x²
- `$H_2O$` → H₂O
- `$x^{10}$` → x¹⁰
- `$a_{i+1}$` → aᵢ₊₁

### Fractions
- `$\frac{a}{b}$` → (a)/(b)

## Example Conversion

**Before:**
```
The sum is $S = n(n+1) / 2 = 36(37) / 2 = 18 \times 37 = 666$

We have $\alpha + \beta \ge \gamma$ and $x^2 + y^2 = r^2$
```

**After:**
```
The sum is S = n(n+1) / 2 = 36(37) / 2 = 18 × 37 = 666

We have α + β ≥ γ and x² + y² = r²
```

## File Structure

```
equationext/
├── manifest.json           # Extension configuration
├── content.js             # Main script that runs on Google Docs/Word
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
├── generate_icons.html   # Tool to regenerate icons if needed
├── generate_icons.js     # Node.js icon generator
└── README.md             # This file
```

## Permissions

The extension requires:
- `activeTab`: To interact with the current tab
- `clipboardRead`: To read pasted content
- Access to `docs.google.com` and `office.com`: To inject the conversion script

## Limitations

- Works best with inline equations (`$...$`)
- Complex LaTeX structures (matrices, cases, etc.) are simplified
- Some advanced LaTeX commands are not supported
- The extension uses Unicode approximations, not rendered equations

## Troubleshooting

### Extension not working?
1. Make sure you're on Google Docs or Microsoft Word Online
2. Check that the extension is enabled in `chrome://extensions/`
3. Try refreshing the page
4. Check the browser console for errors (F12 → Console)

### Conversion not happening automatically?
1. Make sure the pasted text contains `$` delimiters
2. Try using the manual conversion button
3. Check that LaTeX symbols are properly formatted (e.g., `\alpha`, not `alpha`)

### Icons not showing?
1. If needed, open `generate_icons.html` in a browser
2. Download the three icon files (16x16, 48x48, 128x128)
3. Place them in the extension directory

## Development

To modify the extension:

1. Edit the source files (`content.js`, `popup.js`, etc.)
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Future Enhancements

Potential improvements:
- Support for more LaTeX commands
- Better handling of complex equations
- Integration with native equation editors
- Support for display equations (`$$...$$`)
- Options page for customization

## License

This extension is provided as-is for personal use. Feel free to modify and improve it!

## Support

If you encounter issues or have suggestions, please create an issue in the repository.

---

Created to solve the annoying problem of pasting LaTeX equations into Google Docs and Word Online!
