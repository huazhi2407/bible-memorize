import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { addApproval, getApprovalForDate, getApprovalsForStudent, listStudents, addCheckin, adjustPoints, checkDailyPointsAdded } from '../db-firebase.js';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { studentId, date } = req.body || {};
    if (!studentId || !date) {
      return res.status(400).json({ error: '請提供 studentId 與 date' });
    }
    const approverRole = req.user.role;
    if (approverRole !== 'admin' && approverRole !== 'teacher' && approverRole !== 'parent') {
      return res.status(403).json({ error: '只有管理員、老師或家長可以確認學生合格' });
    }
    const ok = await addApproval(studentId, req.user.id, date);
    if (ok) {
      await addCheckin(studentId, date);
      // 學生被確認合格並自動簽到時加分（如果還沒加過）
      if (!(await checkDailyPointsAdded(studentId, date))) {
        await adjustPoints(studentId, 1, '完成簽到', req.user.id, date);
      }
    }
    res.json({ ok: !!ok, alreadyApproved: !ok, autoCheckedIn: ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '確認失敗' });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'parent' && req.user.id !== studentId) {
      return res.status(403).json({ error: '無權限' });
    }
    const approvals = await getApprovalsForStudent(studentId);
    res.json(approvals);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得確認記錄失敗' });
  }
});

router.get('/check/:studentId/:date', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { date } = req.params;
    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'parent' && req.user.id !== studentId) {
      return res.status(403).json({ error: '無權限' });
    }
    const approval = await getApprovalForDate(studentId, date);
    res.json({ approved: !!approval });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '查詢失敗' });
  }
});

router.get('/students', async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'parent') {
      return res.status(403).json({ error: '只有管理員、老師或家長可以查看學生列表' });
    }
    const students = await listStudents();
    res.json(students);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得學生列表失敗' });
  }
});

export { router as approvalsRouter };
