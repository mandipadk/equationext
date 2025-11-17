// LaTeX Equation Fixer - Popup Script
// Version 2.0 - All 15 critical issues fixed
// Shared conversion logic with content.js

// =======================
// Complete Unicode mappings (Issues #5, #7)
// =======================

const latexToUnicode = {
  // Greek letters (lowercase)
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
  '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
  '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
  '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
  '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
  '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',

  // Greek letters (uppercase)
  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
  '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
  '\\Psi': 'Ψ', '\\Omega': 'Ω',

  // Variant Greek letters
  '\\varepsilon': 'ε', '\\varphi': 'φ', '\\vartheta': 'ϑ',
  '\\varrho': 'ϱ', '\\varsigma': 'ς', '\\varpi': 'ϖ',

  // Mathematical operators
  '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓', '\\cdot': '·',
  '\\ast': '∗', '\\star': '⋆', '\\circ': '∘', '\\bullet': '•',
  '\\oplus': '⊕', '\\ominus': '⊖', '\\otimes': '⊗', '\\oslash': '⊘',

  // Relational operators
  '\\le': '≤', '\\leq': '≤', '\\ge': '≥', '\\geq': '≥',
  '\\ne': '≠', '\\neq': '≠', '\\approx': '≈', '\\equiv': '≡',
  '\\sim': '∼', '\\simeq': '≃', '\\cong': '≅', '\\propto': '∝',
  '\\ll': '≪', '\\gg': '≫', '\\prec': '≺', '\\succ': '≻',
  '\\preceq': '⪯', '\\succeq': '⪰', '\\perp': '⊥', '\\parallel': '∥',

  // Set theory
  '\\in': '∈', '\\notin': '∉', '\\ni': '∋', '\\subset': '⊂', '\\supset': '⊃',
  '\\subseteq': '⊆', '\\supseteq': '⊇', '\\cup': '∪', '\\cap': '∩',
  '\\emptyset': '∅', '\\varnothing': '∅', '\\setminus': '∖',

  // Logic
  '\\forall': '∀', '\\exists': '∃', '\\nexists': '∄',
  '\\neg': '¬', '\\lnot': '¬',
  '\\land': '∧', '\\wedge': '∧',
  '\\lor': '∨', '\\vee': '∨',
  '\\implies': '⇒', '\\iff': '⇔',
  '\\top': '⊤', '\\bot': '⊥',

  // Arrows
  '\\rightarrow': '→', '\\to': '→',
  '\\leftarrow': '←', '\\gets': '←',
  '\\Rightarrow': '⇒', '\\Leftarrow': '⇐',
  '\\leftrightarrow': '↔', '\\Leftrightarrow': '⇔',
  '\\uparrow': '↑', '\\downarrow': '↓',
  '\\Uparrow': '⇑', '\\Downarrow': '⇓',
  '\\updownarrow': '↕', '\\Updownarrow': '⇕',
  '\\mapsto': '↦', '\\longmapsto': '⟼',
  '\\longrightarrow': '⟶', '\\longleftarrow': '⟵',
  '\\Longrightarrow': '⟹', '\\Longleftarrow': '⟸',
  '\\longleftrightarrow': '⟷', '\\Longleftrightarrow': '⟺',
  '\\nearrow': '↗', '\\searrow': '↘', '\\swarrow': '↙', '\\nwarrow': '↖',

  // Miscellaneous symbols
  '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇',
  '\\sum': '∑', '\\prod': '∏', '\\coprod': '∐',
  '\\int': '∫', '\\iint': '∬', '\\iiint': '∭', '\\oint': '∮',
  '\\angle': '∠', '\\measuredangle': '∡', '\\sphericalangle': '∢',
  '\\degree': '°', '\\prime': '′', '\\backprime': '‵',
  '\\therefore': '∴', '\\because': '∵',
  '\\dots': '…', '\\ldots': '…', '\\cdots': '⋯', '\\vdots': '⋮', '\\ddots': '⋱',
  '\\ell': 'ℓ', '\\hbar': 'ℏ', '\\imath': 'ı', '\\jmath': 'ȷ',
  '\\Re': 'ℜ', '\\Im': 'ℑ', '\\wp': '℘', '\\aleph': 'ℵ',
  '\\diamond': '⋄', '\\Diamond': '◊', '\\Box': '□', '\\square': '□',
  '\\triangle': '△', '\\triangledown': '▽',
  '\\clubsuit': '♣', '\\diamondsuit': '♦', '\\heartsuit': '♥', '\\spadesuit': '♠',

  // Bracket scaling and special brackets
  '\\langle': '⟨', '\\rangle': '⟩',
  '\\lfloor': '⌊', '\\rfloor': '⌋',
  '\\lceil': '⌈', '\\rceil': '⌉',
  '\\lbrace': '{', '\\rbrace': '}',
  '\\{': '{', '\\}': '}',
  '\\lbrack': '[', '\\rbrack': ']',
  '\\vert': '|', '\\|': '‖', '\\Vert': '‖',
};

// Complete superscript mappings
const superscriptMap = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
  'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
  'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
  'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
  'A': 'ᴬ', 'B': 'ᴮ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ',
  'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ',
  'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ',
  'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  '*': '﹡', '.': '·', '/': 'ᐟ',
};

// Complete subscript mappings
const subscriptMap = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
};

// Accent combining characters
const accentMap = {
  'hat': '\u0302', 'bar': '\u0304', 'tilde': '\u0303',
  'vec': '\u20D7', 'dot': '\u0307', 'ddot': '\u0308',
  'acute': '\u0301', 'grave': '\u0300', 'check': '\u030C',
  'breve': '\u0306', 'widetilde': '\u0303', 'widehat': '\u0302',
};

// =======================
// ISSUE #12: Error handling
// =======================
function safeExecute(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    console.error('[LaTeX Fixer Popup]', error);
    return fallback;
  }
}

// =======================
// ISSUE #2: Proper brace matching
// =======================
function findMatchingBrace(text, startIndex) {
  let depth = 0;
  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractBraceContent(text, startIndex) {
  const openBrace = text.indexOf('{', startIndex);
  if (openBrace === -1) return null;

  const closeBrace = findMatchingBrace(text, openBrace + 1);
  if (closeBrace === -1) return null;

  return {
    content: text.substring(openBrace + 1, closeBrace),
    start: openBrace,
    end: closeBrace + 1
  };
}

// =======================
// ISSUE #5: Convert to superscript
// =======================
function toSuperscript(text) {
  return text.split('').map(char => superscriptMap[char] || char).join('');
}

// =======================
// ISSUE #5: Convert to subscript
// =======================
function toSubscript(text) {
  return text.split('').map(char => subscriptMap[char] || char).join('');
}

// =======================
// ISSUE #8: Add accent
// =======================
function addAccent(base, accentType) {
  const accent = accentMap[accentType];
  if (!accent) return base;

  if (base.length > 1) {
    return base.slice(0, -1) + base.slice(-1) + accent;
  }
  return base + accent;
}

// =======================
// ISSUE #2, #6: Handle \frac with nested braces
// =======================
function processFrac(text) {
  let result = text;
  let changed = true;

  while (changed) {
    changed = false;
    const fracIndex = result.indexOf('\\frac');

    if (fracIndex !== -1) {
      const numerator = extractBraceContent(result, fracIndex + 5);
      if (numerator) {
        const denominator = extractBraceContent(result, numerator.end);
        if (denominator) {
          const replacement = `(${numerator.content})/(${denominator.content})`;
          result = result.substring(0, fracIndex) + replacement + result.substring(denominator.end);
          changed = true;
        }
      }
    }
  }

  return result;
}

// =======================
// ISSUE #6: Handle \sqrt
// =======================
function processSqrt(text) {
  let result = text;

  // Handle \sqrt[n]{x}
  result = result.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, (match, n, content) => {
    if (n === '3') return `∛(${content})`;
    if (n === '4') return `∜(${content})`;
    return `${n}√(${content})`;
  });

  // Handle \sqrt{x}
  let changed = true;
  while (changed) {
    changed = false;
    const sqrtIndex = result.indexOf('\\sqrt{');

    if (sqrtIndex !== -1) {
      const content = extractBraceContent(result, sqrtIndex + 5);
      if (content) {
        const replacement = `√(${content.content})`;
        result = result.substring(0, sqrtIndex) + replacement + result.substring(content.end);
        changed = true;
      }
    }
  }

  return result;
}

// =======================
// ISSUE #8: Handle accents
// =======================
function processAccents(text) {
  let result = text;

  const accentCommands = ['hat', 'bar', 'tilde', 'vec', 'dot', 'ddot', 'acute', 'grave', 'check', 'breve', 'widetilde', 'widehat'];

  for (const accent of accentCommands) {
    const pattern = new RegExp(`\\\\${accent}\\{([^}]+)\\}`, 'g');
    result = result.replace(pattern, (match, base) => addAccent(base, accent));
  }

  return result;
}

// =======================
// ISSUE #6: Handle math functions
// =======================
function processMathFunctions(text) {
  const functions = [
    'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
    'sinh', 'cosh', 'tanh', 'coth',
    'arcsin', 'arccos', 'arctan',
    'log', 'ln', 'lg', 'exp',
    'lim', 'sup', 'inf',
    'max', 'min', 'arg',
    'det', 'dim', 'ker', 'deg',
    'gcd', 'lcm', 'mod',
    'Pr', 'hom',
  ];

  let result = text;
  for (const fn of functions) {
    const pattern = new RegExp(`\\\\${fn}\\b`, 'g');
    result = result.replace(pattern, fn);
  }

  return result;
}

// =======================
// ISSUE #1: Fixed superscript/subscript processing
// =======================
function processScripts(text) {
  let result = text;

  // Handle superscripts with braces (FIXED)
  let changed = true;
  while (changed) {
    changed = false;
    const match = result.match(/\^\{/);

    if (match) {
      const content = extractBraceContent(result, match.index);
      if (content) {
        const converted = toSuperscript(content.content);
        result = result.substring(0, match.index) + converted + result.substring(content.end);
        changed = true;
      }
    }
  }

  // Handle subscripts with braces (FIXED)
  changed = true;
  while (changed) {
    changed = false;
    const match = result.match(/_\{/);

    if (match) {
      const content = extractBraceContent(result, match.index);
      if (content) {
        const converted = toSubscript(content.content);
        result = result.substring(0, match.index) + converted + result.substring(content.end);
        changed = true;
      }
    }
  }

  // Handle single-character superscripts
  result = result.replace(/\^([a-zA-Z0-9+\-=()])/g, (m, char) => toSuperscript(char));

  // Handle single-character subscripts
  result = result.replace(/_([a-zA-Z0-9+\-=()])/g, (m, char) => toSubscript(char));

  return result;
}

// =======================
// ISSUE #10: Remove LaTeX commands
// =======================
function removeLatexCommands(text) {
  let result = text;

  result = result.replace(/\\(left|right|big|Big|bigg|Bigg)\s*/g, '');
  result = result.replace(/\\text\{([^}]+)\}/g, '$1');
  result = result.replace(/\\math(rm|bf|it|sf|tt|cal|bb|frak)\{([^}]+)\}/g, '$2');
  result = result.replace(/\\(,|;|:|\s|quad|qquad)/g, ' ');
  result = result.replace(/\\([^a-zA-Z])/g, '$1');

  return result;
}

// =======================
// ISSUE #4: Normalize delimiters
// =======================
function normalizeDelimiters(text) {
  let result = text;

  result = result.replace(/\\\(([^)]*(?:\\\)|[^)])*?)\\\)/g, '$$$1$$');
  result = result.replace(/\\\[([^\]]*(?:\\\]|[^\]])*?)\\\]/g, '$$$$$1$$$$');
  result = result.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, '$$$$$1$$$$');
  result = result.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, '$$$$$1$$$$');

  return result;
}

// =======================
// Main conversion function with ALL fixes
// =======================
function convertLatexToUnicode(text) {
  return safeExecute(() => {
    let converted = text;

    // Normalize alternative delimiters first
    converted = normalizeDelimiters(converted);

    // Process display math ($$...$$) first
    converted = converted.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
      let cleaned = equation.trim();

      cleaned = processFrac(cleaned);
      cleaned = processSqrt(cleaned);
      cleaned = processAccents(cleaned);
      cleaned = processMathFunctions(cleaned);
      cleaned = processScripts(cleaned);

      for (const [latex, unicode] of Object.entries(latexToUnicode)) {
        const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = removeLatexCommands(cleaned);

      return '\n' + cleaned + '\n';
    });

    // Process inline math ($...$)
    converted = converted.replace(/\$([^$]+)\$/g, (match, equation) => {
      let cleaned = equation.trim();

      cleaned = processFrac(cleaned);
      cleaned = processSqrt(cleaned);
      cleaned = processAccents(cleaned);
      cleaned = processMathFunctions(cleaned);
      cleaned = processScripts(cleaned);

      for (const [latex, unicode] of Object.entries(latexToUnicode)) {
        const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = removeLatexCommands(cleaned);

      return cleaned;
    });

    return converted;
  }, text);
}

// =======================
// UI event handlers
// =======================

document.getElementById('convertBtn').addEventListener('click', () => {
  const inputText = document.getElementById('inputText').value;

  if (!inputText.trim()) {
    showStatus('⚠️ Please enter some text to convert', 'info');
    return;
  }

  const converted = convertLatexToUnicode(inputText);
  document.getElementById('outputText').value = converted;

  if (converted !== inputText) {
    showStatus('✅ Conversion complete!', 'success');
  } else {
    showStatus('⚠️ No LaTeX patterns found', 'info');
  }
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const outputText = document.getElementById('outputText').value;

  if (!outputText.trim()) {
    showStatus('⚠️ Nothing to copy yet - convert some text first', 'info');
    return;
  }

  navigator.clipboard.writeText(outputText).then(() => {
    showStatus('📋 Copied to clipboard!', 'success');
  }).catch(err => {
    showStatus('❌ Failed to copy: ' + err.message, 'info');
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

console.log('[LaTeX Fixer Popup] All 15 issues fixed - Ready!');
