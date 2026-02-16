export function getISOWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function getWeekDates(year, week) {
  const jan1 = new Date(year, 0, 1);
  const day = jan1.getDay() || 7;
  const diff = (week - 1) * 7 - (day - 1) + 1;
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() + diff);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
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
