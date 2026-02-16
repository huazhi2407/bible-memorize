import { isHomophone } from './homophones.js';

/**
 * 比對辨識結果與參考經文，計算字級準確率（0~1）
 * 正規化：去空白與標點後逐字比對；同音字視為正確
 */
export function computeAccuracy(recognized, reference) {
  const a = normalizeForCompare(recognized);
  const b = normalizeForCompare(reference);
  if (b.length === 0) return null;

  let correct = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] === b[i] || isHomophone(a[i], b[i])) correct++;
  }
  // 多出來的參考字算錯
  const total = b.length;
  return total > 0 ? Math.round((correct / total) * 100) / 100 : null;
}

function normalizeForCompare(str) {
  return (str || '')
    .replace(/\s+/g, '')
    .replace(/[，。、；：？！「」『』（）\s]/g, '')
    .split('');
}
