import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getStudentPoints,
  adjustPoints,
  getPointsHistory,
  checkDailyPointsDeduction,
  getRecordingsByUser,
  listStudents,
} from '../db/index.js';

const router = Router();
router.use(authMiddleware);

// 獲取當前用戶的積分
router.get('/me', (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: '只有學生可以查看自己的積分' });
    }
    const points = getStudentPoints(req.user.id);
    const history = getPointsHistory(req.user.id, 20);
    res.json({ points, history });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得積分失敗' });
  }
});

// 獲取指定學生的積分（老師/家長/管理員）
router.get('/student/:studentId', (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'teacher' && userRole !== 'parent') {
      if (req.user.id !== studentId) {
        return res.status(403).json({ error: '無權限' });
      }
    }
    const points = getStudentPoints(studentId);
    const history = getPointsHistory(studentId, 50);
    res.json({ points, history });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得積分失敗' });
  }
});

// 老師調整學生積分
router.post('/adjust', (req, res) => {
  try {
    const { studentId, pointsChange, reason } = req.body || {};
    if (!studentId || pointsChange === undefined || !reason) {
      return res.status(400).json({ error: '請提供 studentId, pointsChange 與 reason' });
    }
    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'teacher' && userRole !== 'parent') {
      return res.status(403).json({ error: '只有管理員、老師或家長可以調整積分' });
    }
    const result = adjustPoints(Number(studentId), Number(pointsChange), reason.trim(), req.user.id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '調整積分失敗' });
  }
});

// 檢查並扣分（如果當天沒有錄音）
router.post('/check-daily', (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: '只有學生可以使用此功能' });
    }
    const date = req.body?.date || new Date().toISOString().slice(0, 10);
    const recordings = getRecordingsByUser(req.user.id);
    const hasRecordingToday = recordings.some((r) => r.created_at && r.created_at.startsWith(date));
    
    if (!hasRecordingToday && !checkDailyPointsDeduction(req.user.id, date)) {
      // 沒有錄音且還沒扣過分，扣分
      const result = adjustPoints(req.user.id, -1, '未錄音扣分', null, date);
      res.json({ deducted: true, ...result });
    } else {
      res.json({ deducted: false, hasRecording: hasRecordingToday });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '檢查失敗' });
  }
});

// 獲取所有學生的積分列表（所有人可見，但學生只能看到積分排行榜）
router.get('/students', (req, res) => {
  try {
    const students = listStudents();
    const studentsWithPoints = students.map((s) => ({
      id: s.id,
      number: s.number,
      name: s.name,
      role: s.role,
      points: getStudentPoints(s.id),
      // 只有管理員、老師或家長可以看到 created_at
      ...(req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'parent' ? { created_at: s.created_at } : {}),
    }));
    res.json(studentsWithPoints);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得學生積分列表失敗' });
  }
});

export { router as pointsRouter };
