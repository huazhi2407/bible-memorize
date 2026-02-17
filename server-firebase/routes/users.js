import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { listUsers, deleteUser, getRecordingsByUser } from '../db-firebase.js';
import { storage, getStorageBucketName } from '../firebase-config.js';

const router = Router();
router.use(authMiddleware);

// 允許用戶刪除自己的帳戶（不需要 admin 權限）
router.delete('/me', async (req, res) => {
  try {
    const id = req.user.id;
    
    // 刪除用戶的錄音文件
    const recordings = await getRecordingsByUser(id);
    const bucket = storage.bucket(getStorageBucketName());
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

// Admin 專用：列出所有用戶
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得使用者失敗' });
  }
});

// Admin 專用：刪除指定用戶
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (id === req.user.id) return res.status(400).json({ error: '無法刪除自己，請使用「刪除我的帳戶」功能' });
    
    // 刪除用戶的錄音文件
    const recordings = await getRecordingsByUser(id);
    const bucket = storage.bucket(getStorageBucketName());
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
