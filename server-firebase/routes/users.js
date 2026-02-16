import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { listUsers, deleteUser, getRecordingsByUser } from '../db-firebase.js';
import { storage } from '../firebase-config.js';

const router = Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得使用者失敗' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id === req.user.id) return res.status(400).json({ error: '無法刪除自己' });
    
    // 刪除用戶的錄音文件
    const recordings = await getRecordingsByUser(id);
    const bucket = storage.bucket();
    for (const r of recordings) {
      const file = bucket.file(`recordings/${r.filename}`);
      await file.delete().catch(() => {}); // 忽略文件不存在的錯誤
    }
    
    await deleteUser(id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '刪除失敗' });
  }
});

export { router as usersRouter };
