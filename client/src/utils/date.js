/** ISO 週數：週一為第一天，含 1/4 的那週為第 1 週 */
export function getISOWeek(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const jan4 = new Date(date.getFullYear(), 0, 4);
  const isoDayJan4 = jan4.getDay() === 0 ? 7 : jan4.getDay();
  const mondayWeek1 = new Date(date.getFullYear(), 0, 4 - (isoDayJan4 - 1));
  const diffMs = date - mondayWeek1;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 0) {
    const prevYear = date.getFullYear() - 1;
    return getISOWeek(new Date(prevYear, 11, 31));
  }
  return Math.floor(diffDays / 7) + 1;
}

/** 回傳該 ISO 年週的週一～週日（7 個 Date，本地時區） */
export function getWeekDates(year, week) {
  const jan4 = new Date(year, 0, 4);
  const isoDayJan4 = jan4.getDay() === 0 ? 7 : jan4.getDay();
  const mondayWeek1 = new Date(year, 0, 4 - (isoDayJan4 - 1));
  const mondayOfWeek = new Date(mondayWeek1);
  mondayOfWeek.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayOfWeek);
    d.setDate(mondayOfWeek.getDate() + i);
    out.push(d);
  }
  return out;
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** 回傳 ISO 星期幾：1=一～7=日 */
export function getISODayOfWeek(d) {
  const day = (d || new Date()).getDay();
  return day === 0 ? 7 : day;
}

/** 回傳本地日期的 YYYY-MM-DD（避免 UTC 造成週曆與「今天」錯位） */
export function toLocalDateString(d) {
  const date = d || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
