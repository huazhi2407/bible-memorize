/** 回傳 ISO 星期幾：1=一～7=日 */
function isoDayOfWeek(d) {
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

/** 第 1 週的週一：含 1/4 的那週的週一（從 1/4 往前減天數，避免 4-n 為負時算錯） */
function getMondayOfWeek1(y) {
  const jan4 = new Date(y, 0, 4, 12, 0, 0, 0);
  const isoDayJan4 = isoDayOfWeek(jan4);
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (isoDayJan4 - 1));
  return monday;
}

/** ISO 週數：週一為第一天，含 1/4 的那週為第 1 週（用中午 12:00 避免午夜/DST 邊界） */
export function getISOWeek(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  const isoDay = isoDayOfWeek(date);
  const mondayOfThisWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (isoDay - 1), 12, 0, 0, 0);
  const mondayWeek1 = getMondayOfWeek1(mondayOfThisWeek.getFullYear());
  if (mondayOfThisWeek < mondayWeek1) {
    return getISOWeek(new Date(mondayOfThisWeek.getFullYear() - 1, 11, 31, 12, 0, 0, 0));
  }
  const diffDays = Math.round((mondayOfThisWeek - mondayWeek1) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}

/** 回傳該 ISO 年週的週一～週日（7 個 Date，本地時區，中午 12:00 避免 DST 邊界） */
export function getWeekDates(year, week) {
  const mondayWeek1 = getMondayOfWeek1(year);
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
