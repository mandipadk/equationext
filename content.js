// LaTeX Equation Fixer - Content Script
// Version 2.1 - All 15 critical issues fixed + 10 enhancements

// =======================
// ENHANCEMENT #25: Memory Management & Optimization
// =======================

// Track event listeners for cleanup
const trackedListeners = new Map();
let isInitialized = false;

// Detect if we're on an actual editor page (not just any Google Docs page)
function isEditorPage() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Google Docs: Check for /document/d/ pattern
  if (hostname.includes('docs.google.com')) {
    return pathname.includes('/document/d/') || pathname.includes('/spreadsheets/d/');
  }

  // Microsoft Word: Check for actual document editor
  if (hostname.includes('office.com') || hostname.includes('officeapps.live.com')) {
    return pathname.includes('/edit') || document.querySelector('[role="main"]') !== null;
  }

  return false;
}

// Add tracked event listener for cleanup
function addTrackedListener(element, event, handler, options) {
  element.addEventListener(event, handler, options);

  const key = `${event}_${Date.now()}_${Math.random()}`;
  trackedListeners.set(key, { element, event, handler, options });

  return key; // Return key for manual removal if needed
}

// Cleanup all resources
function cleanup() {
  // Remove all tracked event listeners
  for (const [key, { element, event, handler, options }] of trackedListeners) {
    try {
      element.removeEventListener(event, handler, options);
    } catch (error) {
      // Element might not exist anymore
    }
  }
  trackedListeners.clear();

  // Clear caches (Enhancement #23)
  if (typeof conversionCache !== 'undefined') {
    conversionCache.clear();
  }
  if (typeof regexCache !== 'undefined') {
    regexCache.clear();
  }

  // Remove floating button if it exists
  const floatingBtn = document.getElementById('latex-converter-btn');
  if (floatingBtn) {
    floatingBtn.remove();
  }

  // Remove undo button if it exists
  const undoBtn = document.getElementById('latex-undo-btn');
  if (undoBtn) {
    undoBtn.remove();
  }

  isInitialized = false;

  if (SETTINGS.enableDebugLogging) {
    console.log('[LaTeX Fixer] Cleaned up all resources');
  }
}

// =======================
// ENHANCEMENT #16: Settings Management
// =======================

let SETTINGS = {
  enableAutoConvert: true,
  showFloatingButton: true,
  showNotifications: true,
  notificationDuration: 3,
  enableDebugLogging: false,
  siteGoogleDocs: true,
  siteMicrosoftWord: true,
  convertInlineMath: true,
  convertDisplayMath: true,
  convertAlternativeDelimiters: true,
  smartDetection: true,
  customMappings: {},
  statistics: {}
};

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    if (result.settings) {
      SETTINGS = { ...SETTINGS, ...result.settings };
      if (SETTINGS.enableDebugLogging) {
        console.log('[LaTeX Fixer] Settings loaded:', SETTINGS);
      }
    }
  } catch (error) {
    console.error('[LaTeX Fixer] Error loading settings:', error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SETTINGS_UPDATED') {
    SETTINGS = { ...SETTINGS, ...request.settings };
    if (SETTINGS.enableDebugLogging) {
      console.log('[LaTeX Fixer] Settings updated:', SETTINGS);
    }
    sendResponse({ success: true });
  }

  if (request.type === 'CONVERT_SELECTION' || request.type === 'CONVERT_SELECTION_SHORTCUT') {
    handleManualConversion();
    sendResponse({ success: true });
  }

  return true;
});

// Handle manual conversion (keyboard shortcut or context menu)
async function handleManualConversion() {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (!selectedText) {
    if (SETTINGS.showNotifications) {
      showNotification('⚠️ Please select text to convert', 'warning');
    }
    return;
  }

  if (!hasLatexContent(selectedText)) {
    if (SETTINGS.showNotifications) {
      showNotification('⚠️ No LaTeX found in selection', 'warning');
    }
    return;
  }

  // ENHANCEMENT #22: Validate LaTeX before conversion
  const validationErrors = validateLatex(selectedText);
  if (validationErrors.length > 0) {
    showValidationErrors(validationErrors);
    trackConversion(selectedText, selectedText, false);
    return;
  }

  const converted = convertLatexToUnicode(selectedText);

  if (converted !== selectedText) {
    const success = await insertText(converted);
    if (success) {
      if (SETTINGS.showNotifications) {
        showNotification('✅ Selected text converted!', 'success');
      }
      // Track statistics
      trackConversion(selectedText, converted, true);
    } else {
      if (SETTINGS.showNotifications) {
        showNotification('⚠️ Conversion succeeded but insertion failed', 'error');
      }
    }
  } else {
    if (SETTINGS.showNotifications) {
      showNotification('⚠️ No LaTeX patterns found', 'warning');
    }
  }
}

// Track conversion statistics (enhancement #21)
function trackConversion(input, output, success) {
  try {
    // Extract symbols used (includes custom mappings)
    const symbols = [];
    const mergedDict = getMergedLatexDictionary();
    for (const [latex, unicode] of Object.entries(mergedDict)) {
      if (input.includes(latex)) {
        symbols.push(latex);
      }
    }

    chrome.runtime.sendMessage({
      type: 'UPDATE_STATISTICS',
      success,
      input: input.substring(0, 500), // Limit length
      output: output.substring(0, 500),
      symbols
    }).catch(() => {});
  } catch (error) {
    console.error('[LaTeX Fixer] Error tracking statistics:', error);
  }
}

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
// ENHANCEMENT #20: Custom LaTeX Mappings
// =======================

// Get merged LaTeX dictionary (built-in + custom mappings)
function getMergedLatexDictionary() {
  // Start with built-in mappings
  const merged = { ...latexToUnicode };

  // Merge custom mappings if they exist
  if (SETTINGS.customMappings && typeof SETTINGS.customMappings === 'object') {
    Object.assign(merged, SETTINGS.customMappings);
  }

  return merged;
}

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
// ISSUE #10: Remove sizing and positioning commands
// =======================
function removeLatexCommands(text) {
  let result = text;

  // Remove \left, \right, \big, \Big, \bigg, \Bigg
  result = result.replace(/\\(left|right|big|Big|bigg|Bigg)\s*/g, '');

  // Remove \text{} but keep content
  result = result.replace(/\\text\{([^}]+)\}/g, '$1');

  // Remove \mathrm{}, \mathbf{}, etc but keep content
  result = result.replace(/\\math(rm|bf|it|sf|tt|cal|bb|frak)\{([^}]+)\}/g, '$2');

  // Remove spacing commands
  result = result.replace(/\\(,|;|:|\s|quad|qquad)/g, ' ');

  // Remove remaining single backslashes before non-command characters
  result = result.replace(/\\([^a-zA-Z])/g, '$1');

  return result;
}

// =======================
// ENHANCEMENT #22: Enhanced Error Messages & Validation
// =======================

function validateLatex(text) {
  const errors = [];

  // Check for unmatched braces
  let braceDepth = 0;
  let lastOpenBrace = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{' && (i === 0 || text[i-1] !== '\\')) {
      braceDepth++;
      if (braceDepth === 1) lastOpenBrace = i;
    } else if (text[i] === '}' && (i === 0 || text[i-1] !== '\\')) {
      braceDepth--;
      if (braceDepth < 0) {
        errors.push({
          type: 'unmatched_braces',
          message: `Unmatched closing brace } at position ${i}`,
          suggestion: 'Check that every } has a matching {'
        });
        braceDepth = 0;
      }
    }
  }

  if (braceDepth > 0) {
    errors.push({
      type: 'unmatched_braces',
      message: `Unmatched opening brace { at position ${lastOpenBrace}`,
      suggestion: 'Check that every { has a matching }'
    });
  }

  // Check for unmatched dollar signs
  const dollarCount = (text.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    errors.push({
      type: 'unmatched_delimiters',
      message: 'Unmatched $ delimiter',
      suggestion: 'LaTeX equations need matching $ or $$ pairs'
    });
  }

  // Find unknown commands (commands not in our dictionary - includes custom mappings)
  const commandPattern = /\\([a-zA-Z]+)/g;
  const unknownCommands = [];
  let match;

  // Get merged dictionary (built-in + custom mappings)
  const mergedDict = getMergedLatexDictionary();

  while ((match = commandPattern.exec(text)) !== null) {
    const command = '\\' + match[1];

    // Check if command exists in our dictionaries (including custom)
    const knownCommand =
      mergedDict[command] ||
      ['frac', 'sqrt', 'text', 'mathrm', 'mathbf', 'mathit', 'hat', 'bar', 'vec', 'dot', 'ddot',
       'tilde', 'left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'begin', 'end',
       'sin', 'cos', 'tan', 'log', 'ln', 'lim', 'max', 'min'].includes(match[1]);

    if (!knownCommand && !unknownCommands.includes(command)) {
      unknownCommands.push(command);
    }
  }

  if (unknownCommands.length > 0) {
    errors.push({
      type: 'unknown_commands',
      message: `Unknown LaTeX commands: ${unknownCommands.join(', ')}`,
      suggestion: 'Check spelling or add custom mappings in settings'
    });
  }

  return errors;
}

function showValidationErrors(errors) {
  if (!errors || errors.length === 0) return;

  const errorMessages = errors.map(e => `• ${e.message}\n  💡 ${e.suggestion}`).join('\n\n');

  const message = `⚠️ LaTeX Validation Issues:\n\n${errorMessages}\n\nOriginal text pasted without conversion.`;

  if (SETTINGS.showNotifications) {
    showNotification(message, 'warning');
  }

  if (SETTINGS.enableDebugLogging) {
    console.warn('[LaTeX Fixer] Validation errors:', errors);
  }
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
// ENHANCEMENT #23: Performance Optimization
// =======================

// Regex cache for better performance
const regexCache = new Map();

function getCachedRegex(pattern, flags = 'g') {
  const key = `${pattern}_${flags}`;
  if (!regexCache.has(key)) {
    regexCache.set(key, new RegExp(pattern, flags));
  }
  return regexCache.get(key);
}

// Memoization cache for conversions
const conversionCache = new Map();
const MAX_CACHE_SIZE = 100;

function getCachedConversion(text) {
  return conversionCache.get(text);
}

function cacheConversion(text, result) {
  if (conversionCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = conversionCache.keys().next().value;
    conversionCache.delete(firstKey);
  }
  conversionCache.set(text, result);
}

// Clear caches periodically to prevent memory leaks
setInterval(() => {
  if (conversionCache.size > 50) {
    conversionCache.clear();
    if (SETTINGS.enableDebugLogging) {
      console.log('[LaTeX Fixer] Cleared conversion cache');
    }
  }
}, 300000); // Every 5 minutes

// Chunked processing for large documents
async function convertLargeDocument(text) {
  const CHUNK_SIZE = 5000;

  if (text.length <= CHUNK_SIZE) {
    return convertLatexToUnicode(text);
  }

  // Split into chunks at equation boundaries
  const chunks = [];
  let currentChunk = '';

  for (let i = 0; i < text.length; i++) {
    currentChunk += text[i];

    if (currentChunk.length >= CHUNK_SIZE && (text[i] === '\n' || text[i] === ' ')) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  // Process chunks with progress
  let result = '';
  for (let i = 0; i < chunks.length; i++) {
    result += convertLatexToUnicode(chunks[i]);

    // Yield to browser to prevent freezing
    if (i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return result;
}

// =======================
// Main conversion function with ALL fixes + Performance
// =======================
function convertLatexToUnicode(text) {
  // Check cache first (enhancement #23)
  const cached = getCachedConversion(text);
  if (cached !== undefined) {
    return cached;
  }

  const result = safeExecute(() => {
    let converted = text;

    // ISSUE #4: Normalize alternative delimiters first
    converted = normalizeDelimiters(converted);

    // Process display math ($$...$$) first
    converted = converted.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
      let cleaned = equation.trim();

      // Apply all transformations in order
      cleaned = processFrac(cleaned);           // ISSUE #2, #6
      cleaned = processSqrt(cleaned);           // ISSUE #6
      cleaned = processAccents(cleaned);        // ISSUE #8
      cleaned = processMathFunctions(cleaned);  // ISSUE #6
      cleaned = processScripts(cleaned);        // ISSUE #1, #5

      // Replace LaTeX symbols (including custom mappings - Enhancement #20)
      const mergedDict = getMergedLatexDictionary();
      for (const [latex, unicode] of Object.entries(mergedDict)) {
        const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = removeLatexCommands(cleaned);   // ISSUE #10

      return '\n' + cleaned + '\n';
    });

    // Process inline math ($...$)
    converted = converted.replace(/\$([^$]+)\$/g, (match, equation) => {
      let cleaned = equation.trim();

      // Apply all transformations in order
      cleaned = processFrac(cleaned);           // ISSUE #2, #6
      cleaned = processSqrt(cleaned);           // ISSUE #6
      cleaned = processAccents(cleaned);        // ISSUE #8
      cleaned = processMathFunctions(cleaned);  // ISSUE #6
      cleaned = processScripts(cleaned);        // ISSUE #1, #5

      // Replace LaTeX symbols (including custom mappings - Enhancement #20)
      const mergedDict = getMergedLatexDictionary();
      for (const [latex, unicode] of Object.entries(mergedDict)) {
        const regex = new RegExp(latex.replace(/\\/g, '\\\\'), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = removeLatexCommands(cleaned);   // ISSUE #10

      return cleaned;
    });

    return converted;
  }, text, 'Conversion error');

  // Cache the result (enhancement #23)
  if (result) {
    cacheConversion(text, result);
  }

  return result;
}

// =======================
// ISSUE #11: Race condition protection
// =======================
let isProcessing = false;
let lastConvertedText = '';
let processingTimeout = null;

// =======================
// ENHANCEMENT #24: One-Click Undo System
// =======================
const conversionHistory = [];
let undoButton = null;
let undoButtonTimeout = null;

function trackConversionForUndo(original, converted, selection) {
  conversionHistory.push({
    timestamp: Date.now(),
    original,
    converted,
    selection: {
      start: selection?.anchorOffset || 0,
      end: selection?.focusOffset || 0
    }
  });

  // Keep last 5 conversions
  if (conversionHistory.length > 5) {
    conversionHistory.shift();
  }
}

async function undoLastConversion() {
  const last = conversionHistory.pop();
  if (!last) {
    if (SETTINGS.showNotifications) {
      showNotification('⚠️ No conversion to undo', 'warning');
    }
    return;
  }

  // Restore original text
  const success = await insertText(last.original);

  if (success) {
    if (SETTINGS.showNotifications) {
      showNotification('↶ Conversion undone', 'success');
    }
  }

  hideUndoButton();
}

function showUndoButton(duration = 5000) {
  if (!SETTINGS.showFloatingButton) return;

  // Remove existing button
  if (undoButton && undoButton.parentNode) {
    undoButton.remove();
  }

  undoButton = document.createElement('button');
  undoButton.id = 'latex-undo-btn';
  undoButton.innerHTML = '↶ Undo Conversion';
  undoButton.title = 'Undo last conversion (Ctrl+Shift+Z)';

  undoButton.style.cssText = `
    position: fixed !important;
    bottom: 140px !important;
    right: 20px !important;
    background: #f44336 !important;
    color: white !important;
    border: none !important;
    padding: 10px 16px !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    box-shadow: 0 2px 10px rgba(244, 67, 54, 0.4) !important;
    z-index: 2147483645 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    transition: all 0.2s !important;
    animation: slideInFromRight 0.3s ease-out !important;
    font-family: Arial, sans-serif !important;
    pointer-events: auto !important;
  `;

  undoButton.addEventListener('mouseenter', () => {
    undoButton.style.background = '#d32f2f !important';
    undoButton.style.transform = 'scale(1.05) !important';
  });

  undoButton.addEventListener('mouseleave', () => {
    undoButton.style.background = '#f44336 !important';
    undoButton.style.transform = 'scale(1) !important';
  });

  undoButton.addEventListener('click', undoLastConversion);

  document.body.appendChild(undoButton);

  // Auto-hide after duration
  if (undoButtonTimeout) {
    clearTimeout(undoButtonTimeout);
  }

  undoButtonTimeout = setTimeout(hideUndoButton, duration);
}

function hideUndoButton() {
  if (undoButton && undoButton.parentNode) {
    undoButton.style.animation = 'slideOutToRight 0.3s ease-in';
    setTimeout(() => {
      if (undoButton && undoButton.parentNode) {
        undoButton.remove();
      }
    }, 300);
  }
}

// Keyboard shortcut for undo: Ctrl+Shift+Z
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
    e.preventDefault();
    undoLastConversion();
  }
});

// Add CSS animation for undo button
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutToRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

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

    const duration = (SETTINGS.notificationDuration || 3) * 1000;
    const timeoutId = setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease-in reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);

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
  // ENHANCEMENT #16: Check if auto-convert is enabled
  if (!SETTINGS.enableAutoConvert) {
    return; // Auto-convert disabled, don't interfere
  }

  // ISSUE #11: Prevent race conditions
  if (isProcessing) {
    if (SETTINGS.enableDebugLogging) {
      console.log('[LaTeX Fixer] Already processing, skipping...');
    }
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

    // ENHANCEMENT #22: Validate LaTeX before conversion
    const textToValidate = plainText || htmlData;
    const validationErrors = validateLatex(textToValidate);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      trackConversion(textToValidate, textToValidate, false);
      return; // Don't convert if validation fails
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
      // Use large document handler for big texts (enhancement #23)
      if (plainText.length > 5000) {
        convertedText = await convertLargeDocument(plainText);
      } else {
        convertedText = convertLatexToUnicode(plainText);
      }
    }

    // Check if anything changed and it's not the same as last conversion
    if (convertedText !== plainText && convertedText !== lastConvertedText) {
      e.preventDefault();

      const success = await insertText(convertedText);

      if (success) {
        lastConvertedText = convertedText;
        if (SETTINGS.showNotifications) {
          showNotification('✅ LaTeX equations converted!', 'success');
        }
        // Track statistics (enhancement #21)
        trackConversion(plainText, convertedText, true);
        // Track for undo (enhancement #24)
        trackConversionForUndo(plainText, convertedText, window.getSelection());
        // Show undo button (enhancement #24)
        showUndoButton();
      } else {
        if (SETTINGS.showNotifications) {
          showNotification('⚠️ Conversion succeeded but insertion failed', 'error');
        }
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
    // ENHANCEMENT #16: Check if floating button is enabled
    if (!SETTINGS.showFloatingButton) {
      return;
    }

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

        // ENHANCEMENT #22: Validate LaTeX before conversion
        const validationErrors = validateLatex(selectedText);
        if (validationErrors.length > 0) {
          showValidationErrors(validationErrors);
          trackConversion(selectedText, selectedText, false);
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
// Initialize extension (Enhanced for #25)
// =======================
async function initialize() {
  // ENHANCEMENT #25: Only initialize on actual editor pages
  if (!isEditorPage()) {
    console.log('[LaTeX Fixer] Not an editor page, skipping initialization');
    return;
  }

  if (isInitialized) {
    console.log('[LaTeX Fixer] Already initialized, skipping');
    return;
  }

  // ENHANCEMENT #16: Load settings first
  await loadSettings();

  safeExecute(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addConversionButton);
    } else {
      addConversionButton();
    }

    isInitialized = true;

    console.log('[LaTeX Fixer] Extension loaded successfully - Version 2.1 with all enhancements!');
    if (SETTINGS.enableDebugLogging) {
      console.log('[LaTeX Fixer] Settings:', SETTINGS);
    }
  }, null, 'Initialization error');
}

// ENHANCEMENT #25: Cleanup on page unload
addTrackedListener(window, 'beforeunload', cleanup, { once: true });

// ENHANCEMENT #25: Monitor navigation for SPA (Single Page Apps like Google Docs)
let lastUrl = location.href;
const navigationObserver = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;

    // URL changed - cleanup and reinitialize if on editor page
    cleanup();

    if (isEditorPage()) {
      // Wait a bit for page to stabilize
      setTimeout(initialize, 500);
    }
  }
});

navigationObserver.observe(document, { subtree: true, childList: true });

// Start initialization
initialize();
