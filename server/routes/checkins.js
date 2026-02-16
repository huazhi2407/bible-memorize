import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { addCheckin, getCheckinsForWeek, getCheckinsForUser, getApprovalForDate, adjustPoints, checkDailyPointsAdded } from '../db/index.js';

const router = Router();
router.use(authMiddleware);

router.post('/', (req, res) => {
  try {
    const date = req.body?.date || new Date().toISOString().slice(0, 10);
    const userRole = req.user.role;
    if (userRole === 'student') {
      const approval = getApprovalForDate(req.user.id, date);
      if (!approval) {
        return res.status(403).json({ error: '學生需先被老師或家長確認合格後才能簽到' });
      }
    }
    const ok = addCheckin(req.user.id, date);
    if (ok && userRole === 'student') {
      // 學生完成簽到時自動加分（如果還沒加過）
      if (!checkDailyPointsAdded(req.user.id, date)) {
        adjustPoints(req.user.id, 1, '完成簽到', null, date);
      }
    }
    res.json({ ok: !!ok, alreadyCheckedIn: !ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '簽到失敗' });
  }
});

router.get('/', (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const week = req.query.week ? Number(req.query.week) : getISOWeek(new Date());
    const dates = getCheckinsForWeek(req.user.id, year, week);
    res.json({ year, week, dates });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得簽到失敗' });
  }
});

router.get('/all', (req, res) => {
  try {
    const dates = getCheckinsForUser(req.user.id);
    res.json({ dates });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得簽到失敗' });
  }
});

function getISOWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export { router as checkinsRouter };
