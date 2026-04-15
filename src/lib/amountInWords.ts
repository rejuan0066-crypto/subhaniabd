/**
 * Convert a number to Bengali words for money receipts.
 * e.g., 1250 → "এক হাজার দুইশত পঞ্চাশ টাকা মাত্র"
 */

const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];

const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

function twoDigit(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? tens[t] : ones[o] + (tens[t] ? 'এ' + tens[t] : '');
}

export function numberToBanglaWords(num: number): string {
  if (num === 0) return 'শূন্য টাকা মাত্র';
  if (num < 0) return 'ঋণাত্মক ' + numberToBanglaWords(-num);

  const n = Math.floor(num);
  const parts: string[] = [];

  // কোটি (crore) = 10,000,000
  const crore = Math.floor(n / 10000000);
  if (crore > 0) parts.push(convertBelow1000(crore) + ' কোটি');

  // লক্ষ (lakh) = 100,000
  const lakh = Math.floor((n % 10000000) / 100000);
  if (lakh > 0) parts.push(convertBelow1000(lakh) + ' লক্ষ');

  // হাজার (thousand) = 1,000
  const thousand = Math.floor((n % 100000) / 1000);
  if (thousand > 0) parts.push(convertBelow1000(thousand) + ' হাজার');

  // শত (hundred)
  const hundred = Math.floor((n % 1000) / 100);
  if (hundred > 0) parts.push(ones[hundred] + 'শত');

  // remaining
  const remainder = n % 100;
  if (remainder > 0) parts.push(twoDigit(remainder));

  return parts.join(' ') + ' টাকা মাত্র';
}

function convertBelow1000(n: number): string {
  if (n < 100) return twoDigit(n);
  const h = Math.floor(n / 100);
  const r = n % 100;
  return ones[h] + 'শত' + (r > 0 ? ' ' + twoDigit(r) : '');
}

/** Convert English digits to Bengali digits */
export function toBanglaDigits(str: string | number): string {
  const digits = '০১২৩৪৫৬৭৮৯';
  return String(str).replace(/\d/g, d => digits[parseInt(d)]);
}
