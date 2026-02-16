import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { listUsers, deleteUser, getRecordingsByUserId } from '../db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.join(__dirname, '..', 'storage');

const router = Router();
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', (req, res) => {
  try {
    const users = listUsers();
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得使用者失敗' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) return res.status(400).json({ error: '無法刪除自己' });
    const recordings = getRecordingsByUserId(id);
    for (const r of recordings) {
      const fp = path.join(storageDir, r.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    deleteUser(id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '刪除失敗' });
  }
});

export { router as usersRouter };
