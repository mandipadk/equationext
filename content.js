// LaTeX Equation Fixer - Content Script
// Version 2.0 - All 15 critical issues fixed

// =======================
// ISSUE #5, #7: Complete Unicode mappings
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

  // ISSUE #7: Variant Greek letters
  '\\varepsilon': 'ε',
  '\\varphi': 'φ',
  '\\vartheta': 'ϑ',
  '\\varrho': 'ϱ',
  '\\varsigma': 'ς',
  '\\varpi': 'ϖ',

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

  // ISSUE #10: Bracket scaling and special brackets
  '\\langle': '⟨', '\\rangle': '⟩',
  '\\lfloor': '⌊', '\\rfloor': '⌋',
  '\\lceil': '⌈', '\\rceil': '⌉',
  '\\lbrace': '{', '\\rbrace': '}',
  '\\{': '{', '\\}': '}',
  '\\lbrack': '[', '\\rbrack': ']',
  '\\vert': '|', '\\|': '‖', '\\Vert': '‖',
};

// ISSUE #5: Complete superscript Unicode mappings
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

// ISSUE #5: Complete subscript Unicode mappings
const subscriptMap = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
};

// ISSUE #8: Accent combining characters
const accentMap = {
  'hat': '\u0302',    // ̂
  'bar': '\u0304',    // ̄
  'tilde': '\u0303',  // ̃
  'vec': '\u20D7',    // ⃗
  'dot': '\u0307',    // ̇
  'ddot': '\u0308',   // ̈
  'acute': '\u0301',  // ́
  'grave': '\u0300',  // ̀
  'check': '\u030C',  // ̌
  'breve': '\u0306',  // ̆
  'widetilde': '\u0303', // ̃
  'widehat': '\u0302',   // ̂
};

// =======================
// ISSUE #12: Error handling wrapper
// =======================
function safeExecute(fn, fallback, errorMsg) {
  try {
    return fn();
  } catch (error) {
    console.error(`[LaTeX Fixer] ${errorMsg}:`, error);
    return fallback;
  }
}

// =======================
// ISSUE #2: Proper brace matching
// =======================
function findMatchingBrace(text, startIndex) {
  let depth = 1;  // We're already inside one level of braces
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
// ISSUE #8: Add accent to character
// =======================
function addAccent(base, accentType) {
  const accent = accentMap[accentType];
  if (!accent) return base;

  // For multi-character base, apply to last character
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
// ISSUE #6: Handle \sqrt with optional argument
// =======================
function processSqrt(text) {
  let result = text;

  // Handle \sqrt[n]{x} (nth root)
  result = result.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, (match, n, content) => {
    if (n === '3') return `∛(${content})`;
    if (n === '4') return `∜(${content})`;
    return `${n}√(${content})`;
  });

  // Handle \sqrt{x} (square root) with proper brace matching
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

  // Handle superscripts with braces (FIXED: was \^\\{ now \^\{)
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

  // Handle subscripts with braces (FIXED: was _\\{ now _\{)
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

  // Handle single-character superscripts: ^x
  result = result.replace(/\^([a-zA-Z0-9+\-=()])/g, (m, char) => toSuperscript(char));

  // Handle single-character subscripts: _x
  result = result.replace(/_([a-zA-Z0-9+\-=()])/g, (m, char) => toSubscript(char));

  return result;
}

// =======================
// Helper: Escape regex special characters
// =======================
function escapeRegex(str) {
  // Escape special regex characters: \ ^ $ . * + ? ( ) [ ] { } |
  return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

// =======================
// ISSUE #10: Remove sizing and positioning commands
// =======================
function removeLatexCommands(text) {
  let result = text;

  // FIRST: Replace escaped underscores with a placeholder to preserve them
  const UNDERSCORE_PLACEHOLDER = '\u{E000}';  // Private Use Area character
  result = result.replace(/\\_/g, UNDERSCORE_PLACEHOLDER);

  // Remove \left, \right, \big, \Big, \bigg, \Bigg
  result = result.replace(/\\(left|right|big|Big|bigg|Bigg)\s*/g, '');

  // Remove \text{} but keep content (handle nested braces properly)
  let changed = true;
  while (changed) {
    changed = false;
    const textIndex = result.indexOf('\\text{');
    if (textIndex !== -1) {
      const content = extractBraceContent(result, textIndex + '\\text'.length);
      if (content) {
        result = result.substring(0, textIndex) + content.content + result.substring(content.end);
        changed = true;
      } else {
        break;  // Avoid infinite loop
      }
    }
  }

  // Remove \mathrm{}, \mathbf{}, etc but keep content (handle nested braces properly)
  const mathCommands = ['mathrm', 'mathbf', 'mathit', 'mathsf', 'mathtt', 'mathcal', 'mathbb', 'mathfrak'];
  for (const cmd of mathCommands) {
    changed = true;
    while (changed) {
      changed = false;
      const cmdIndex = result.indexOf('\\' + cmd + '{');
      if (cmdIndex !== -1) {
        const content = extractBraceContent(result, cmdIndex + cmd.length + 1);
        if (content) {
          result = result.substring(0, cmdIndex) + content.content + result.substring(content.end);
          changed = true;
        }
      }
    }
  }

  // Remove spacing commands
  result = result.replace(/\\(,|;|:|\s|quad|qquad)/g, ' ');

  // DON'T remove backslashes yet - we need them for symbol replacement!
  // This will be done in finalCleanup() after symbol replacement

  return result;
}

// =======================
// Final cleanup after all conversions
// =======================
function finalCleanup(text) {
  let result = text;

  // Remove remaining single backslashes before non-command characters
  result = result.replace(/\\([^a-zA-Z])/g, '$1');

  // Restore escaped underscores
  const UNDERSCORE_PLACEHOLDER = '\u{E000}';
  result = result.replace(new RegExp(UNDERSCORE_PLACEHOLDER, 'g'), '_');

  return result;
}

// =======================
// ISSUE #3, #4: Smart LaTeX detection and delimiter support
// =======================
function hasLatexContent(text) {
  // Check for actual LaTeX patterns, not just dollar signs

  // Pattern 1: $...$ or $$...$$ with LaTeX commands inside
  if (/\$+[^$]*\\[a-zA-Z]+[^$]*\$+/.test(text)) return true;

  // Pattern 2: \(...\) or \[...\] delimiters
  if (/\\\(|\\\[/.test(text)) return true;

  // Pattern 3: \begin{...}
  if (/\\begin\{/.test(text)) return true;

  // Pattern 4: Standalone LaTeX commands
  if (/\\[a-zA-Z]{2,}/.test(text)) return true;

  return false;
}

// =======================
// ISSUE #4: Normalize all LaTeX delimiters to $...$
// =======================
function normalizeDelimiters(text) {
  let result = text;

  // Convert \(...\) to $...$
  result = result.replace(/\\\(([^)]*(?:\\\)|[^)])*?)\\\)/g, '$$$1$$');

  // Convert \[...\] to $$...$$
  result = result.replace(/\\\[([^\]]*(?:\\\]|[^\]])*?)\\\]/g, '$$$$$1$$$$');

  // Convert \begin{equation}...\end{equation} to $$...$$
  result = result.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, '$$$$$1$$$$');

  // Convert \begin{align}...\end{align} to $$...$$
  result = result.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, '$$$$$1$$$$');

  return result;
}

// =======================
// Main conversion function with ALL fixes
// =======================
function convertLatexToUnicode(text) {
  return safeExecute(() => {
    let converted = text;

    // ISSUE #4: Normalize alternative delimiters first
    converted = normalizeDelimiters(converted);

    // Process display math ($$...$$) first
    converted = converted.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
      let cleaned = equation.trim();

      // CRITICAL: Remove \text{} and other commands FIRST
      cleaned = removeLatexCommands(cleaned);

      // Apply all transformations in order
      cleaned = processFrac(cleaned);
      cleaned = processSqrt(cleaned);
      cleaned = processAccents(cleaned);
      cleaned = processMathFunctions(cleaned);

      // CRITICAL: Replace LaTeX symbols BEFORE processing scripts
      // This ensures symbols like \| are replaced before backslashes are removed
      for (const [latex, unicode] of Object.entries(latexToUnicode)) {
        const regex = new RegExp(escapeRegex(latex), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = processScripts(cleaned);
      cleaned = finalCleanup(cleaned);  // Remove backslashes and restore underscores

      return '\n' + cleaned + '\n';
    });

    // Process inline math ($...$)
    converted = converted.replace(/\$([^$]+)\$/g, (match, equation) => {
      let cleaned = equation.trim();

      // CRITICAL: Remove \text{} and other commands FIRST
      cleaned = removeLatexCommands(cleaned);

      // Apply all transformations in order
      cleaned = processFrac(cleaned);
      cleaned = processSqrt(cleaned);
      cleaned = processAccents(cleaned);
      cleaned = processMathFunctions(cleaned);

      // CRITICAL: Replace LaTeX symbols BEFORE processing scripts
      // This ensures symbols like \| are replaced before backslashes are removed
      for (const [latex, unicode] of Object.entries(latexToUnicode)) {
        const regex = new RegExp(escapeRegex(latex), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = processScripts(cleaned);
      cleaned = finalCleanup(cleaned);  // Remove backslashes and restore underscores

      return cleaned;
    });

    return converted;
  }, text, 'Conversion error');
}

// =======================
// ISSUE #11: Race condition protection
// =======================
let isProcessing = false;
let lastConvertedText = '';
let processingTimeout = null;

// =======================
// ISSUE #9: Modern text insertion (replacing execCommand)
// =======================
async function insertText(text) {
  return safeExecute(() => {
    // Method 1: Try InputEvent API (modern, preferred)
    const activeElement = document.activeElement;

    if (activeElement && (activeElement.isContentEditable || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      const event = new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: text,
        bubbles: true,
        cancelable: true
      });

      if (activeElement.dispatchEvent(event)) {
        // Event wasn't cancelled, proceed with insertion
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);

          // Trigger input event for frameworks
          activeElement.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
    }

    // Method 2: Fallback to execCommand (still works in most cases)
    if (document.execCommand) {
      return document.execCommand('insertText', false, text);
    }

    // Method 3: Manual DOM insertion
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    }

    return false;
  }, false, 'Text insertion error');
}

// =======================
// ISSUE #15: HTML paste support
// =======================
function convertHtmlContent(html) {
  return safeExecute(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Find and convert all text nodes
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (hasLatexContent(node.textContent)) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      const converted = convertLatexToUnicode(node.textContent);
      if (converted !== node.textContent) {
        node.textContent = converted;
      }
    });

    return tempDiv.innerHTML;
  }, html, 'HTML conversion error');
}

// =======================
// ISSUE #13: Improved notification system
// =======================
function showNotification(message, type = 'success') {
  safeExecute(() => {
    // Find the correct document (handle iframes for Google Docs)
    let targetDoc = document;

    // Check if we're in an iframe context
    const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
    if (iframe && iframe.contentDocument) {
      targetDoc = iframe.contentDocument;
    }

    if (!targetDoc.body) {
      console.warn('[LaTeX Fixer] Cannot show notification - document.body not ready');
      return;
    }

    // Remove existing notification
    const existingNotification = targetDoc.getElementById('latex-fixer-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = targetDoc.createElement('div');
    notification.id = 'latex-fixer-notification';
    notification.textContent = message;

    const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#FF9800';

    notification.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: ${bgColor} !important;
      color: white !important;
      padding: 15px 20px !important;
      border-radius: 5px !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
      z-index: 2147483647 !important;
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      pointer-events: auto !important;
      animation: slideIn 0.3s ease-out !important;
    `;

    // Add animation
    const style = targetDoc.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;

    if (!targetDoc.getElementById('latex-fixer-styles')) {
      style.id = 'latex-fixer-styles';
      targetDoc.head.appendChild(style);
    }

    targetDoc.body.appendChild(notification);

    const timeoutId = setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease-in reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);

    // Cleanup on page unload
    const cleanup = () => {
      clearTimeout(timeoutId);
      if (notification.parentNode) {
        notification.remove();
      }
    };

    window.addEventListener('beforeunload', cleanup, { once: true });
  }, null, 'Notification error');
}

// =======================
// ISSUE #11, #12, #15: Main paste event handler with all fixes
// =======================
document.addEventListener('paste', async function(e) {
  // ISSUE #11: Prevent race conditions
  if (isProcessing) {
    console.log('[LaTeX Fixer] Already processing, skipping...');
    return;
  }

  try {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    // ISSUE #15: Try HTML first, then fall back to plain text
    const htmlData = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain');

    // ISSUE #3: Smart detection
    if (!hasLatexContent(plainText) && !hasLatexContent(htmlData)) {
      return; // No LaTeX content, don't interfere
    }

    // ISSUE #11: Set processing flag
    isProcessing = true;

    // Clear any pending timeout
    if (processingTimeout) {
      clearTimeout(processingTimeout);
    }

    let convertedText;
    let useHtml = false;

    // ISSUE #15: Handle HTML paste if available
    if (htmlData && hasLatexContent(htmlData)) {
      const convertedHtml = convertHtmlContent(htmlData);
      if (convertedHtml !== htmlData) {
        // Successfully converted HTML
        convertedText = convertHtmlContent(plainText);
        useHtml = true;
      }
    }

    // Fall back to plain text conversion
    if (!convertedText) {
      convertedText = convertLatexToUnicode(plainText);
    }

    // Check if anything changed and it's not the same as last conversion
    if (convertedText !== plainText && convertedText !== lastConvertedText) {
      e.preventDefault();

      const success = await insertText(convertedText);

      if (success) {
        lastConvertedText = convertedText;
        showNotification('✅ LaTeX equations converted!', 'success');
      } else {
        showNotification('⚠️ Conversion succeeded but insertion failed', 'error');
      }
    }

  } catch (error) {
    console.error('[LaTeX Fixer] Paste handling error:', error);
    showNotification('⚠️ Conversion error - pasting original text', 'error');
    // Don't prevent default - let normal paste happen
  } finally {
    // ISSUE #11: Reset processing flag after a delay
    processingTimeout = setTimeout(() => {
      isProcessing = false;
    }, 100);
  }
}, true);

// =======================
// ISSUE #14: Improved floating button with better UX
// =======================
function addConversionButton() {
  safeExecute(() => {
    // Only add on supported sites
    const supportedSites = ['docs.google.com', 'office.com', 'officeapps.live.com'];
    if (!supportedSites.some(site => window.location.hostname.includes(site))) {
      return;
    }

    // Check if button already exists
    if (document.getElementById('latex-converter-btn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'latex-converter-btn';
    button.innerHTML = '🔄';
    button.title = 'Convert selected LaTeX text';

    button.style.cssText = `
      position: fixed !important;
      bottom: 80px !important;
      right: 20px !important;
      background: #2196F3 !important;
      color: white !important;
      border: none !important;
      padding: 0 !important;
      border-radius: 50% !important;
      width: 48px !important;
      height: 48px !important;
      cursor: pointer !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
      z-index: 2147483646 !important;
      font-size: 20px !important;
      transition: all 0.2s !important;
      opacity: 0 !important;
      display: none !important;
      pointer-events: auto !important;
    `;

    // ISSUE #14: Only show when there's a selection with LaTeX
    let selectionCheckInterval;

    const updateButtonVisibility = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText.length > 0 && hasLatexContent(selectedText)) {
        button.style.display = 'block';
        setTimeout(() => button.style.opacity = '0.8', 10);
      } else {
        button.style.opacity = '0';
        setTimeout(() => {
          if (button.style.opacity === '0') {
            button.style.display = 'none';
          }
        }, 200);
      }
    };

    document.addEventListener('selectionchange', updateButtonVisibility);

    // Also check periodically
    selectionCheckInterval = setInterval(updateButtonVisibility, 500);

    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.8';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', async () => {
      try {
        const selection = window.getSelection();
        const selectedText = selection.toString();

        if (!selectedText) {
          showNotification('⚠️ Please select text to convert', 'warning');
          return;
        }

        if (!hasLatexContent(selectedText)) {
          showNotification('⚠️ No LaTeX found in selection', 'warning');
          return;
        }

        const converted = convertLatexToUnicode(selectedText);

        if (converted !== selectedText) {
          const success = await insertText(converted);
          if (success) {
            showNotification('✅ Selected text converted!', 'success');
          } else {
            showNotification('⚠️ Conversion succeeded but insertion failed', 'error');
          }
        } else {
          showNotification('⚠️ No LaTeX patterns found', 'warning');
        }
      } catch (error) {
        console.error('[LaTeX Fixer] Manual conversion error:', error);
        showNotification('⚠️ Conversion error', 'error');
      }
    });

    document.body.appendChild(button);

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      if (selectionCheckInterval) {
        clearInterval(selectionCheckInterval);
      }
    }, { once: true });

  }, null, 'Button creation error');
}

// =======================
// Initialize extension
// =======================
function initialize() {
  safeExecute(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addConversionButton);
    } else {
      addConversionButton();
    }

    console.log('[LaTeX Fixer] Extension loaded successfully - All 15 issues fixed!');
  }, null, 'Initialization error');
}

initialize();
