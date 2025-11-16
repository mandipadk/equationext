// Same conversion functions as in content.js
const latexToUnicode = {
  // Greek letters
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
  '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
  '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
  '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
  '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
  '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',

  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
  '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
  '\\Psi': 'Ψ', '\\Omega': 'Ω',

  // Mathematical operators
  '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓', '\\cdot': '·',

  // Relational operators
  '\\le': '≤', '\\leq': '≤', '\\ge': '≥', '\\geq': '≥',
  '\\ne': '≠', '\\neq': '≠', '\\approx': '≈', '\\equiv': '≡',
  '\\sim': '∼', '\\simeq': '≃', '\\cong': '≅', '\\propto': '∝',

  // Set theory
  '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\supset': '⊃',
  '\\subseteq': '⊆', '\\supseteq': '⊇', '\\cup': '∪', '\\cap': '∩',
  '\\emptyset': '∅', '\\varnothing': '∅',

  // Logic
  '\\forall': '∀', '\\exists': '∃', '\\neg': '¬', '\\land': '∧',
  '\\lor': '∨', '\\implies': '⇒', '\\iff': '⇔',

  // Arrows
  '\\rightarrow': '→', '\\leftarrow': '←', '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐', '\\leftrightarrow': '↔', '\\Leftrightarrow': '⇔',

  // Miscellaneous
  '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇',
  '\\sum': '∑', '\\prod': '∏', '\\int': '∫',
  '\\sqrt': '√', '\\angle': '∠', '\\degree': '°',
  '\\therefore': '∴', '\\because': '∵'
};

function toSuperscript(char) {
  const superscripts = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ'
  };
  return superscripts[char] || '^' + char;
}

function toSubscript(char) {
  const subscripts = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'i': 'ᵢ',
    'j': 'ⱼ', 'k': 'ₖ', 'n': 'ₙ', 'p': 'ₚ', 't': 'ₜ'
  };
  return subscripts[char] || '_' + char;
}

function convertLatexToUnicode(text) {
  let converted = text;

  // Replace LaTeX commands with Unicode equivalents
  for (const [latex, unicode] of Object.entries(latexToUnicode)) {
    const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
    converted = converted.replace(regex, unicode);
  }

  // Handle inline math (single $)
  converted = converted.replace(/\$([^$]+)\$/g, (match, equation) => {
    let cleaned = equation.trim();

    // Replace \frac{a}{b} with (a)/(b)
    cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

    // Replace ^{x} with superscript
    cleaned = cleaned.replace(/\^\{([^}]+)\}/g, (m, exp) => {
      if (exp.length === 1) return toSuperscript(exp);
      let result = '';
      for (let char of exp) {
        result += toSuperscript(char);
      }
      return result;
    });

    // Replace ^x with superscript (single char)
    cleaned = cleaned.replace(/\^(\w)/g, (m, exp) => toSuperscript(exp));

    // Replace _{x} with subscript
    cleaned = cleaned.replace(/_\{([^}]+)\}/g, (m, sub) => {
      if (sub.length === 1) return toSubscript(sub);
      let result = '';
      for (let char of sub) {
        result += toSubscript(char);
      }
      return result;
    });

    // Replace _x with subscript (single char)
    cleaned = cleaned.replace(/_(\w)/g, (m, sub) => toSubscript(sub));

    // Remove remaining curly braces
    cleaned = cleaned.replace(/[{}]/g, '');

    // Remove \text command but keep content
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');

    return cleaned;
  });

  // Handle display math (double $$)
  converted = converted.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
    let cleaned = equation.trim();
    cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    cleaned = cleaned.replace(/\^\{([^}]+)\}/g, (m, exp) => {
      let result = '';
      for (let char of exp) result += toSuperscript(char);
      return result;
    });
    cleaned = cleaned.replace(/_\{([^}]+)\}/g, (m, sub) => {
      let result = '';
      for (let char of sub) result += toSubscript(char);
      return result;
    });
    cleaned = cleaned.replace(/[{}]/g, '');
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
    return '\n' + cleaned + '\n';
  });

  return converted;
}

// UI event handlers
document.getElementById('convertBtn').addEventListener('click', () => {
  const inputText = document.getElementById('inputText').value;

  if (!inputText.trim()) {
    showStatus('Please enter some text to convert', 'info');
    return;
  }

  const converted = convertLatexToUnicode(inputText);
  document.getElementById('outputText').value = converted;

  if (converted !== inputText) {
    showStatus('✅ Conversion complete!', 'success');
  } else {
    showStatus('No LaTeX patterns found', 'info');
  }
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const outputText = document.getElementById('outputText').value;

  if (!outputText.trim()) {
    showStatus('Nothing to copy yet - convert some text first', 'info');
    return;
  }

  navigator.clipboard.writeText(outputText).then(() => {
    showStatus('📋 Copied to clipboard!', 'success');
  }).catch(err => {
    showStatus('Failed to copy: ' + err.message, 'info');
  });
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('inputText').value = '';
  document.getElementById('outputText').value = '';
  document.getElementById('status').style.display = 'none';
});

// Auto-convert as user types (with debounce)
let typingTimer;
document.getElementById('inputText').addEventListener('input', () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    const inputText = document.getElementById('inputText').value;
    if (inputText.trim()) {
      const converted = convertLatexToUnicode(inputText);
      document.getElementById('outputText').value = converted;
    }
  }, 500);
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}
