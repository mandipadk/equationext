// LaTeX to Unicode/HTML conversion mappings
const latexToUnicode = {
  // Greek letters
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',

  // Capital Greek letters
  '\\Gamma': 'Γ',
  '\\Delta': 'Δ',
  '\\Theta': 'Θ',
  '\\Lambda': 'Λ',
  '\\Xi': 'Ξ',
  '\\Pi': 'Π',
  '\\Sigma': 'Σ',
  '\\Phi': 'Φ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',

  // Mathematical operators
  '\\times': '×',
  '\\div': '÷',
  '\\pm': '±',
  '\\mp': '∓',
  '\\cdot': '·',

  // Relational operators
  '\\le': '≤',
  '\\leq': '≤',
  '\\ge': '≥',
  '\\geq': '≥',
  '\\ne': '≠',
  '\\neq': '≠',
  '\\approx': '≈',
  '\\equiv': '≡',
  '\\sim': '∼',
  '\\simeq': '≃',
  '\\cong': '≅',
  '\\propto': '∝',

  // Set theory
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\supset': '⊃',
  '\\subseteq': '⊆',
  '\\supseteq': '⊇',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\emptyset': '∅',
  '\\varnothing': '∅',

  // Logic
  '\\forall': '∀',
  '\\exists': '∃',
  '\\neg': '¬',
  '\\land': '∧',
  '\\lor': '∨',
  '\\implies': '⇒',
  '\\iff': '⇔',

  // Arrows
  '\\rightarrow': '→',
  '\\leftarrow': '←',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\leftrightarrow': '↔',
  '\\Leftrightarrow': '⇔',

  // Miscellaneous
  '\\infty': '∞',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\int': '∫',
  '\\sqrt': '√',
  '\\angle': '∠',
  '\\degree': '°',
  '\\therefore': '∴',
  '\\because': '∵',

  // Text commands
  '\\text': ''
};

// Convert LaTeX equations to readable format
function convertLatexToUnicode(text) {
  let converted = text;

  // Replace LaTeX commands with Unicode equivalents
  for (const [latex, unicode] of Object.entries(latexToUnicode)) {
    const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
    converted = converted.replace(regex, unicode);
  }

  // Handle inline math (single $)
  converted = converted.replace(/\$([^$]+)\$/g, (match, equation) => {
    // Clean up common LaTeX patterns in equations
    let cleaned = equation.trim();

    // Replace \frac{a}{b} with a/b
    cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

    // Replace ^{x} with superscript if single char, otherwise keep as is
    cleaned = cleaned.replace(/\^\\{([^}]+)\\}/g, (m, exp) => {
      if (exp.length === 1) return toSuperscript(exp);
      return '^(' + exp + ')';
    });

    cleaned = cleaned.replace(/\^(\w)/g, (m, exp) => toSuperscript(exp));

    // Replace _{x} with subscript
    cleaned = cleaned.replace(/_\\{([^}]+)\\}/g, (m, sub) => {
      if (sub.length === 1) return toSubscript(sub);
      return '_(' + sub + ')';
    });

    cleaned = cleaned.replace(/_(\w)/g, (m, sub) => toSubscript(sub));

    // Remove remaining curly braces
    cleaned = cleaned.replace(/[{}]/g, '');

    // Remove \text command but keep the content
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');

    return cleaned;
  });

  // Handle display math (double $$)
  converted = converted.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
    let cleaned = equation.trim();
    cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    cleaned = cleaned.replace(/\^\\{([^}]+)\\}/g, '^($1)');
    cleaned = cleaned.replace(/_\\{([^}]+)\\}/g, '_($1)');
    cleaned = cleaned.replace(/[{}]/g, '');
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
    return '\n' + cleaned + '\n';
  });

  return converted;
}

// Convert to superscript
function toSuperscript(char) {
  const superscripts = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ'
  };
  return superscripts[char] || '^' + char;
}

// Convert to subscript
function toSubscript(char) {
  const subscripts = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'i': 'ᵢ', 'k': 'ₖ'
  };
  return subscripts[char] || '_' + char;
}

// Listen for paste events
document.addEventListener('paste', function(e) {
  // Get clipboard data
  const clipboardData = e.clipboardData || window.clipboardData;
  const pastedText = clipboardData.getData('text/plain');

  // Check if the pasted text contains LaTeX
  if (pastedText.includes('$') || pastedText.includes('\\')) {
    // Convert LaTeX to Unicode
    const convertedText = convertLatexToUnicode(pastedText);

    // If the text was modified, prevent default paste and insert converted text
    if (convertedText !== pastedText) {
      e.preventDefault();

      // For Google Docs, we need to insert text in a special way
      if (window.location.hostname.includes('docs.google.com')) {
        // Try to insert using document.execCommand (works in some cases)
        document.execCommand('insertText', false, convertedText);
      } else {
        // For other editors, try standard insertion
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(convertedText));

          // Move cursor to end of inserted text
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      // Show notification
      showNotification('LaTeX equations converted!');
    }
  }
}, true);

// Show a temporary notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add a manual conversion button (for already pasted content)
function addConversionButton() {
  const button = document.createElement('button');
  button.textContent = '🔄 Convert LaTeX';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2196F3;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
  `;

  button.addEventListener('click', () => {
    // Get selected text
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText) {
      const converted = convertLatexToUnicode(selectedText);
      if (converted !== selectedText) {
        document.execCommand('insertText', false, converted);
        showNotification('Selected text converted!');
      } else {
        showNotification('No LaTeX found in selection');
      }
    } else {
      showNotification('Please select text to convert');
    }
  });

  document.body.appendChild(button);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addConversionButton);
} else {
  addConversionButton();
}

console.log('LaTeX Equation Fixer extension loaded');
