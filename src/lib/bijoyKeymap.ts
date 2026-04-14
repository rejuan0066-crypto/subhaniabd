/**
 * Standard Bijoy Classic Keyboard Layout → Unicode Bengali Converter
 * Maps physical QWERTY keystrokes (as used with Bijoy/SutonnyMJ) to Unicode Bengali.
 *
 * Layout reference: Bijoy Classic (the de-facto standard for Bijoy users in Bangladesh)
 */

const BIJOY_KEYMAP: Record<string, string> = {
  // ── Number row (unshifted) ──
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

  // ── Number row (shifted) ──
  '!': '!',
  '@': '@',
  '#': '#',
  '$': '৳',
  '%': '%',
  '^': '^',
  '&': '্',   // Hasanta (virama) – used for conjuncts
  '*': '*',
  '(': '(',
  ')': ')',

  // ── Top row (unshifted): q w e r t y u i o p [ ] ──
  'q': 'দ',
  'w': 'ূ',
  'e': 'ী',
  'r': 'র',
  't': 'ট',
  'y': 'ে',
  'u': 'ু',
  'i': 'ি',
  'o': 'ও',
  'p': 'প',
  '[': 'ড',
  ']': 'চ',

  // ── Top row (shifted): Q W E R T Y U I O P { } ──
  'Q': 'ধ',
  'W': 'ঊ',
  'E': 'ঈ',
  'R': 'ড়',
  'T': 'ঠ',
  'Y': 'ৈ',
  'U': 'উ',
  'I': 'ই',
  'O': 'ঔ',
  'P': 'ফ',
  '{': 'ঢ',
  '}': 'ঞ',

  // ── Home row (unshifted): a s d f g h j k l ; ' ──
  'a': 'া',   // আ-কার
  's': 'স',
  'd': 'ড',
  'f': 'ত',
  'g': 'গ',
  'h': 'হ',
  'j': 'জ',
  'k': 'ক',
  'l': 'ল',

  // ── Home row (shifted): A S D F G H J K L : " ──
  'A': 'আ',
  'S': 'ষ',
  'D': 'ঢ',
  'F': 'থ',
  'G': 'ঘ',
  'H': 'অ',
  'J': 'ঝ',
  'K': 'খ',
  'L': 'ং',

  // ── Bottom row (unshifted): z x c v b n m , . / ──
  'z': 'য',
  'x': 'শ',
  'c': 'চ',
  'v': 'ভ',
  'b': 'ব',
  'n': 'ন',
  'm': 'ম',
  ',': ',',
  '.': '।',   // Dari (Bengali full stop)
  '/': '্র',  // র-ফলা (ref)

  // ── Bottom row (shifted): Z X C V B N M < > ? ──
  'Z': '্য',  // য-ফলা
  'X': 'ঞ',
  'C': 'ছ',
  'V': 'ঋ',
  'B': 'ণ',
  'N': 'ঁ',   // Chandrabindu
  'M': 'ঃ',   // Visarga

  // ── Special keys ──
  '\\': '্র',  // র-ফলা (ref) alternate
  '|': 'র্',   // রেফ (র + হসন্ত before next char)
  '`': '‌',    // ZWNJ
  '~': '়',    // Nukta
  '-': '-',
  '_': '_',
  '+': '+',
  '=': '=',
  '<': '<',
  '>': '>',
  '?': '?',
  ';': ';',
  ':': ':',
  "'": "'",
  '"': '"',

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
