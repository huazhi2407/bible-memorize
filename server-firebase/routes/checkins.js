import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { addCheckin, getCheckinsForWeek, getCheckinsForUser, getApprovalForDate, adjustPoints, checkDailyPointsAdded, getRecordingsByUser, deleteRecording } from '../db-firebase.js';
import { storage, getStorageBucketName } from '../firebase-config.js';

function getISOWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const router = Router();
router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const date = req.body?.date || new Date().toISOString().slice(0, 10);
    const userRole = req.user.role;
    if (userRole === 'student') {
      const approval = await getApprovalForDate(req.user.id, date);
      if (!approval) {
        return res.status(403).json({ error: '學生需先被老師或家長確認合格後才能簽到' });
      }
    }
    const ok = await addCheckin(req.user.id, date);
    if (ok) {
      // 簽到成功後，清理當天的其他錄音，只保留最新的
      try {
        const allRecordings = await getRecordingsByUser(req.user.id);
        const dateStr = date.slice(0, 10);
        const dailyRecordings = allRecordings.filter((r) => {
          if (!r.created_at) return false;
          const recDate = typeof r.created_at === 'string' ? r.created_at.slice(0, 10) : '';
          return recDate === dateStr;
        });
        
        if (dailyRecordings.length > 1) {
          // 保留最新的錄音，刪除其他的
          const keepRecording = dailyRecordings[0]; // 已經按 created_at 降序排序
          const toDelete = dailyRecordings.slice(1);
          
          const bucket = storage.bucket(getStorageBucketName());
          for (const rec of toDelete) {
            // 刪除 Firebase Storage 中的文件
            const file = bucket.file(`recordings/${rec.filename}`);
            await file.delete().catch(() => {});
            // 刪除資料庫記錄
            await deleteRecording(rec.id);
          }
        }
      } catch (cleanupError) {
        console.error('清理當天錄音失敗:', cleanupError);
        // 不影響簽到結果，只記錄錯誤
      }
      
      if (userRole === 'student') {
        // 學生完成簽到時自動加分（如果還沒加過）
        if (!(await checkDailyPointsAdded(req.user.id, date))) {
          await adjustPoints(req.user.id, 1, '完成簽到', null, date);
        }
      }
    }
    res.json({ ok: !!ok, alreadyCheckedIn: !ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '簽到失敗' });
  }
});

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登入' });
    }
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const week = req.query.week ? Number(req.query.week) : getISOWeek(new Date());
    const dates = await getCheckinsForWeek(req.user.id, year, week);
    res.json({ year, week, dates });
  } catch (e) {
    console.error('取得簽到失敗:', e);
    console.error('錯誤詳情:', e.message, e.stack);
    res.status(500).json({ error: '取得簽到失敗: ' + (e.message || String(e)) });
  }
});

router.get('/all', async (req, res) => {
  try {
    const dates = await getCheckinsForUser(req.user.id);
    res.json({ dates });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得簽到失敗' });
  }
});

export { router as checkinsRouter };
