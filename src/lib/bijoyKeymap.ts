/**
 * Bijoy Keyboard Layout → Unicode Bengali Converter
 * Maps ASCII keystrokes (as produced by Bijoy layout) to Unicode Bengali characters.
 * This handles single-key mappings. Conjunct/juktakkhar handling is done via hasanta logic.
 */

// Bijoy ASCII → Unicode Bengali character map
const BIJOY_MAP: Record<string, string> = {
  // Vowels (স্বরবর্ণ)
  'F': 'ত্',  // special - handled below
  
  // Consonants via Shift keys & normal keys
  'k': 'ক',
  'K': 'খ',
  'g': 'গ',
  'G': 'ঘ',
  'O': 'ঙ',
  'c': 'চ',
  'C': 'ছ',
  'j': 'জ',
  'J': 'ঝ',
  'q': 'ঞ',
  't': 'ট',
  'T': 'ঠ',
  'D': 'ড',
  'f': 'ধ',  // Note: this is different
  'Y': 'ঢ',
  'N': 'ণ',
  '/': 'ত',
  'Q': 'থ',
  'd': 'দ',
  'W': 'ঢ',
  'n': 'ন',
  'p': 'প',
  'P': 'ফ',
  'b': 'ব',
  'B': 'ভ',
  'm': 'ম',
  'h': 'হ',
  'r': 'র',
  'l': 'ল',
  'x': 'শ',
  'M': 'ষ',
  's': 'স',
  'o': 'অ',
  'e': 'ে',
  'i': 'ি',
  'I': 'ী',
  'u': 'ু',
  'U': 'ূ',
  'a': 'া',
  'w': 'ও',
  'y': 'প',  // revisit
  'v': 'র',
  'V': 'ল',
  'z': 'য',
  'Z': '্য',
};

// Complete Bijoy keyboard mapping (corrected & comprehensive)
const BIJOY_KEYMAP: Record<string, string> = {
  // Row 1 (number row with shift)
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '0': '০',

  // Vowels
  'o': 'অ',
  'O': 'ঔ',
  'A': 'আ',
  'i': 'ি',
  'I': 'ী',
  'u': 'ু',
  'U': 'ূ',
  'e': 'ে',
  'E': 'ৈ',
  'a': 'া',
  
  // Independent vowels  
  'w': 'ও',
  
  // Consonants
  'k': 'ক',
  'K': 'খ',
  'g': 'গ',
  'G': 'ঘ',
  'c': 'চ',
  'C': 'ছ',
  'j': 'জ',
  'J': 'ঝ',
  't': 'ট',
  'T': 'ঠ',
  'D': 'ড',
  'N': 'ণ',
  'd': 'দ',
  'n': 'ন',
  'p': 'প',
  'P': 'ফ',
  'b': 'ব',
  'B': 'ভ',
  'm': 'ম',
  'r': 'র',
  'l': 'ল',
  's': 'স',
  'h': 'হ',
  'x': 'শ',
  'M': 'ষ',
  'z': 'য',
  'q': 'ঞ',
  'Q': 'থ',
  'f': 'ধ',
  'F': 'ত্র',
  'v': 'র',
  'V': 'ল',
  'W': 'ঢ',
  'Y': 'ঢ়',
  'y': 'য়',
  
  // Hasanta (virama) - used for conjuncts
  '&': '্',
  
  // Vowel signs (কার)
  // a → া (already mapped)
  // i → ি
  // I → ী
  // u → ু  
  // U → ূ
  // e → ে
  // E → ৈ
  
  // Special characters
  '`': '‌', // ZWNJ
  '~': '়',
  '!': '!',
  '@': '@',
  '#': '#',
  '$': '৳',
  '%': '%',
  '^': '^',
  '*': '*',
  '(': '(',
  ')': ')',
  '-': '-',
  '_': '_',
  '+': '+',
  '=': '=',
  
  // Punctuation
  '.': '।',
  ',': ',',
  ';': ';',
  ':': ':',
  '?': '?',
  '/': 'ত',
  '<': '<',
  '>': '>',
  
  // Chandrabindu, Anusvara, Visarga
  'S': 'ং',
  'R': 'ঃ',
  'H': 'ঁ',

  // Ref (র-ফলা above)
  '\\': '্র',
  '|': 'র্',

  // য-ফলা
  'Z': '্য',

  // Space
  ' ': ' ',
};

/**
 * Convert a single Bijoy keystroke to Unicode Bengali
 */
export function bijoyCharToUnicode(char: string): string {
  return BIJOY_KEYMAP[char] ?? char;
}

/**
 * Convert a full Bijoy ASCII string to Unicode Bengali
 * This is a simplified single-character mapper.
 */
export function bijoyStringToUnicode(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += bijoyCharToUnicode(text[i]);
  }
  return result;
}

/**
 * Check if a character is a Bijoy-mappable key
 */
export function isBijoyKey(char: string): boolean {
  return char in BIJOY_KEYMAP;
}
