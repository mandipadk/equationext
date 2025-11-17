// Node.js test script for LaTeX Fixer
// Run with: node test.js

// Copy all the conversion logic from popup.js
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

const subscriptMap = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
};

const accentMap = {
  'hat': '\u0302', 'bar': '\u0304', 'tilde': '\u0303',
  'vec': '\u20D7', 'dot': '\u0307', 'ddot': '\u0308',
  'acute': '\u0301', 'grave': '\u0300', 'check': '\u030C',
  'breve': '\u0306', 'widetilde': '\u0303', 'widehat': '\u0302',
};

function safeExecute(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    console.error('[LaTeX Fixer]', error);
    return fallback;
  }
}

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

function toSuperscript(text) {
  return text.split('').map(char => superscriptMap[char] || char).join('');
}

function toSubscript(text) {
  return text.split('').map(char => subscriptMap[char] || char).join('');
}

function addAccent(base, accentType) {
  const accent = accentMap[accentType];
  if (!accent) return base;

  if (base.length > 1) {
    return base.slice(0, -1) + base.slice(-1) + accent;
  }
  return base + accent;
}

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

function processSqrt(text) {
  let result = text;

  result = result.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, (match, n, content) => {
    if (n === '3') return `∛(${content})`;
    if (n === '4') return `∜(${content})`;
    return `${n}√(${content})`;
  });

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

function processAccents(text) {
  let result = text;

  const accentCommands = ['hat', 'bar', 'tilde', 'vec', 'dot', 'ddot', 'acute', 'grave', 'check', 'breve', 'widetilde', 'widehat'];

  for (const accent of accentCommands) {
    const pattern = new RegExp(`\\\\${accent}\\{([^}]+)\\}`, 'g');
    result = result.replace(pattern, (match, base) => addAccent(base, accent));
  }

  return result;
}

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

function processScripts(text) {
  let result = text;

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

  result = result.replace(/\^([a-zA-Z0-9+\-=()])/g, (m, char) => toSuperscript(char));
  result = result.replace(/_([a-zA-Z0-9+\-=()])/g, (m, char) => toSubscript(char));

  return result;
}

function escapeRegex(str) {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

function removeLatexCommands(text) {
  let result = text;

  // FIRST: Replace escaped underscores with a placeholder to preserve them
  const UNDERSCORE_PLACEHOLDER = '\u{E000}';  // Private Use Area character
  result = result.replace(/\\_/g, UNDERSCORE_PLACEHOLDER);

  result = result.replace(/\\(left|right|big|Big|bigg|Bigg)\s*/g, '');

  let changed = true;
  while (changed) {
    changed = false;
    const textIndex = result.indexOf('\\text{');
    if (textIndex !== -1) {
      // Start searching for the opening brace right after '\text'
      const content = extractBraceContent(result, textIndex + '\\text'.length);
      if (content) {
        result = result.substring(0, textIndex) + content.content + result.substring(content.end);
        changed = true;
      } else {
        // If we can't extract content, break to avoid infinite loop
        break;
      }
    }
  }

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

  result = result.replace(/\\(,|;|:|\s|quad|qquad)/g, ' ');

  // DON'T remove backslashes yet - we need them for symbol replacement!
  // result = result.replace(/\\([^a-zA-Z])/g, '$1');

  // DON'T restore underscores yet - do it at the very end
  // result = result.replace(new RegExp(UNDERSCORE_PLACEHOLDER, 'g'), '_');

  return result;
}

// New function to clean up remaining LaTeX artifacts AFTER symbol replacement
function finalCleanup(text) {
  let result = text;

  // Remove remaining backslashes before non-alphabetic characters
  result = result.replace(/\\([^a-zA-Z])/g, '$1');

  // Restore escaped underscores
  const UNDERSCORE_PLACEHOLDER = '\u{E000}';
  result = result.replace(new RegExp(UNDERSCORE_PLACEHOLDER, 'g'), '_');

  return result;
}

function normalizeDelimiters(text) {
  let result = text;

  result = result.replace(/\\\(([^)]*(?:\\\)|[^)])*?)\\\)/g, '$$$1$$');
  result = result.replace(/\\\[([^\]]*(?:\\\]|[^\]])*?)\\\]/g, '$$$$$1$$$$');
  result = result.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, '$$$$$1$$$$');
  result = result.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, '$$$$$1$$$$');

  return result;
}

function convertLatexToUnicode(text) {
  return safeExecute(() => {
    let converted = text;

    converted = normalizeDelimiters(converted);

    converted = converted.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
      let cleaned = equation.trim();

      cleaned = removeLatexCommands(cleaned);
      cleaned = processFrac(cleaned);
      cleaned = processSqrt(cleaned);
      cleaned = processAccents(cleaned);
      cleaned = processMathFunctions(cleaned);

      // Replace LaTeX symbols BEFORE processing scripts and removing backslashes
      for (const [latex, unicode] of Object.entries(latexToUnicode)) {
        const regex = new RegExp(escapeRegex(latex), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = processScripts(cleaned);
      cleaned = finalCleanup(cleaned);  // Remove backslashes and restore underscores

      return '\n' + cleaned + '\n';
    });

    converted = converted.replace(/\$([^$]+)\$/g, (match, equation) => {
      let cleaned = equation.trim();

      cleaned = removeLatexCommands(cleaned);
      cleaned = processFrac(cleaned);
      cleaned = processSqrt(cleaned);
      cleaned = processAccents(cleaned);
      cleaned = processMathFunctions(cleaned);

      // Replace LaTeX symbols BEFORE processing scripts and removing backslashes
      for (const [latex, unicode] of Object.entries(latexToUnicode)) {
        const regex = new RegExp(escapeRegex(latex), 'g');
        cleaned = cleaned.replace(regex, unicode);
      }

      cleaned = processScripts(cleaned);
      cleaned = finalCleanup(cleaned);  // Remove backslashes and restore underscores

      return cleaned;
    });

    return converted;
  }, text);
}

// Test cases
const tests = [
  {
    name: "Simple \\text{} with subscript",
    input: "$I_{\\text{total}}$",
    expected: "Iₜₒₜₐₗ"
  },
  {
    name: "\\text{} with underscore",
    input: "$$I_{\\text{theo\\_disk}} = \\frac{1}{2}MR^2$$",
    expected: "\nIₜₕₑₒ_dᵢₛₖ = (1)/(2)MR²\n"
  },
  {
    name: "Pipe character - should NOT insert ‖ everywhere",
    input: "$a + b$",
    expected: "a + b"
  },
  {
    name: "Actual pipe symbol",
    input: "$\\|x\\|$",
    expected: "‖x‖"
  },
  {
    name: "Complex expression with \\sum",
    input: "$\\sum \\tau = I\\alpha$",
    expected: "∑ τ = Iα"
  },
  {
    name: "User's FULL text - Moment of Inertia",
    input: `Moment of Inertia, or rotational inertia ($I$), is the rotational equivalent of mass. While mass describes an object's resistance to linear acceleration, the moment of inertia describes an object's resistance to angular acceleration ($\\alpha$). It is a fundamental property of a rotating body that depends on both its total mass ($M$) and how that mass is distributed relative to the axis of rotation ($R$). For a uniform solid disk, the theoretical moment of inertia is given by:

$$I_{\\text{theo\\_disk}} = \\frac{1}{2}MR^2$$

This experiment determines the moment of inertia experimentally by applying Newton's Second Law for Rotation, $\\sum \\tau = I\\alpha$. This principle states that a net external torque ($\\tau$) applied to an object will cause an angular acceleration ($\\alpha$) that is inversely proportional to the object's moment of inertia ($I$). By rearranging this to $I = \\frac{\\tau}{\\alpha}$, we can find the experimental moment of inertia by measuring the applied torque and the resulting acceleration.

The angular acceleration ($\\alpha$) is measured directly by finding the slope of the angular velocity vs. time graph from the Rotary Motion Sensor. The torque ($\\tau$) is supplied by a hanging mass ($m$) attached to a string wrapped around the sensor's pulley of radius ($r$). This torque is caused by the string's tension ($T$), giving $\\tau = Tr$. The tension is found using Newton's Second Law on the hanging mass: $\\sum F = mg - T = ma$, which gives $T = m(g - a)$. Substituting this into the torque equation, we get $\\tau = m(g - a)r$.

By substituting the expressions for $\\tau$ and $\\alpha$ (using the no-slip condition $a = \\alpha r$) into the rotational dynamics equation, we can solve for the total moment of inertia:

$$I_{\\text{total}} = \\frac{\\tau}{\\alpha} = \\frac{m(g - a)r}{(a/r)} = \\frac{m r^2 (g - a)}{a}$$

This formula gives the total inertia of the rotating system. To find the moment of inertia of the disk alone, the inertia of the sensor ($I_{\\text{sensor}}$) must be measured in a separate trial and subtracted: $I_{\\text{disk\\_only}} = I_{\\text{total}} - I_{\\text{sensor}}$.`,
    expected: null  // We'll just check it doesn't have the broken output
  }
];

console.log('Running LaTeX Fixer Tests...\n');

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const output = convertLatexToUnicode(test.input);

  let success;
  if (test.expected === null) {
    // For the user's full text, just check it doesn't have the broken patterns
    const noPipeEverywhere = !output.includes('‖I‖‖');
    const hasCorrectTheoDisk = output.includes('Iₜₕₑₒ_dᵢₛₖ');
    const hasCorrectTotal = output.includes('Iₜₒₜₐₗ');
    const hasCorrectSensor = output.includes('Iₛₑₙₛₒᵣ');
    const hasCorrectDiskOnly = output.includes('Idᵢₛₖ_ₒₙₗy');
    success = noPipeEverywhere && hasCorrectTheoDisk && hasCorrectTotal && hasCorrectSensor && hasCorrectDiskOnly;

    if (!success) {
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      console.log(`   Pipe everywhere: ${!noPipeEverywhere ? 'FAILED' : 'OK'}`);
      console.log(`   I_theo_disk: ${hasCorrectTheoDisk ? 'OK' : 'FAILED'}`);
      console.log(`   I_total: ${hasCorrectTotal ? 'OK' : 'FAILED'}`);
      console.log(`   I_sensor: ${hasCorrectSensor ? 'OK' : 'FAILED'}`);
      console.log(`   I_disk_only: ${hasCorrectDiskOnly ? 'OK' : 'FAILED'}`);
      console.log('');
      failed++;
    } else {
      console.log(`✅ Test ${index + 1}: ${test.name}`);
      passed++;
    }
  } else {
    success = output === test.expected;

    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: ${test.name}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      console.log(`   Input:    ${JSON.stringify(test.input.substring(0, 100))}...`);
      console.log(`   Expected: ${JSON.stringify(test.expected)}`);
      console.log(`   Got:      ${JSON.stringify(output)}`);
      console.log('');
    }
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed}/${tests.length} tests passed`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
