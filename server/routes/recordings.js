import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import {
  createRecording,
  getRecordingsByUser,
  getAllRecordings,
  getRecordingById,
  deleteRecording as dbDeleteRecording,
} from '../db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.join(__dirname, '..', 'storage');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}.webm`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/webm' || file.originalname?.endsWith('.webm')) {
      cb(null, true);
    } else {
      cb(new Error('只接受 webm 音檔'));
    }
  },
});

const router = Router();

router.use(authMiddleware);

router.post('/', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未收到音檔' });
    const filename = path.basename(req.file.path);
    const id = createRecording(req.user.id, filename);
    res.status(201).json({
      id,
      filename,
      audioUrl: `/storage/${filename}`,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '上傳失敗' });
  }
});

router.get('/', (req, res) => {
  try {
    const userId = req.query.userId;
    const userRole = req.user.role;
    if (userRole === 'admin' && userId) {
      const list = getRecordingsByUser(Number(userId));
      return res.json(list.map((r) => ({ ...r, audioUrl: `/storage/${r.filename}` })));
    }
    if (userRole === 'admin' && !userId) {
      const list = getAllRecordings();
      return res.json(list.map((r) => ({ ...r, audioUrl: `/storage/${r.filename}` })));
    }
    if ((userRole === 'teacher' || userRole === 'parent') && !userId) {
      const list = getAllRecordings();
      return res.json(list.map((r) => ({ ...r, audioUrl: `/storage/${r.filename}` })));
    }
    if ((userRole === 'teacher' || userRole === 'parent') && userId) {
      const list = getRecordingsByUser(Number(userId));
      return res.json(list.map((r) => ({ ...r, audioUrl: `/storage/${r.filename}` })));
    }
    const list = getRecordingsByUser(req.user.id);
    res.json(list.map((r) => ({ ...r, audioUrl: `/storage/${r.filename}` })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得錄音失敗' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const rec = getRecordingById(id);
    if (!rec) return res.status(404).json({ error: '找不到錄音' });
    const userRole = req.user.role;
    if (userRole === 'teacher' || userRole === 'parent') {
      return res.status(403).json({ error: '老師/家長無權限刪除錄音' });
    }
    const isAdmin = userRole === 'admin';
    if (!isAdmin && rec.user_id !== req.user.id) {
      return res.status(403).json({ error: '無法刪除他人的錄音' });
    }
    const filePath = path.join(storageDir, rec.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    dbDeleteRecording(id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '刪除失敗' });
  }
});

export { router as recordingsRouter };
