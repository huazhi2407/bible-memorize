import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { getScripturePlan, createOrUpdateScripturePlan, listScripturePlans } from '../db/index.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const week = req.query.week ? Number(req.query.week) : getISOWeek(new Date());
    const plan = getScripturePlan(year, week);
    if (!plan) return res.json(null);
    const segments = [
      plan.day1_text,
      plan.day2_text,
      plan.day3_text,
      plan.day4_text,
      plan.day5_text,
      plan.day6_text,
      plan.day7_text,
    ];
    res.json({ id: plan.id, year: plan.year, week: plan.week, segments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得經文失敗' });
  }
});

router.get('/list', authMiddleware, adminOnly, (req, res) => {
  try {
    const list = listScripturePlans();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得列表失敗' });
  }
});

router.post('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const { year, week, segments } = req.body || {};
    if (year == null || week == null || !Array.isArray(segments) || segments.length < 7) {
      return res.status(400).json({ error: '請提供 year, week 與 7 段經文 (segments 陣列)' });
    }
    const id = createOrUpdateScripturePlan(Number(year), Number(week), segments);
    res.json({ id, year: Number(year), week: Number(week) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '儲存失敗' });
  }
});

function getISOWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export { router as scripturePlansRouter };
