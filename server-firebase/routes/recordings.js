import { Router } from 'express';
import multer from 'multer';
import { storage } from '../firebase-config.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import {
  createRecording,
  getRecordingsByUser,
  getAllRecordings,
  getRecordingById,
  deleteRecording as dbDeleteRecording,
} from '../db-firebase.js';

const router = Router();
router.use(authMiddleware);

// 配置 multer（內存存儲）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/webm' || file.originalname?.endsWith('.webm')) {
      cb(null, true);
    } else {
      cb(new Error('只接受 webm 音檔'));
    }
  },
});

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未收到音檔' });
    
    const filename = `${uuidv4()}.webm`;
    const bucket = storage.bucket();
    const file = bucket.file(`recordings/${filename}`);
    
    // 上傳到 Firebase Storage
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'audio/webm',
      },
    });
    
    stream.on('error', (error) => {
      console.error('上傳錯誤:', error);
      res.status(500).json({ error: '上傳失敗' });
    });
    
    stream.on('finish', async () => {
      try {
        const id = await createRecording(req.user.id, filename);
        res.status(201).json({
          id,
          filename,
          audioUrl: `/storage/${filename}`,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('創建記錄錯誤:', error);
        res.status(500).json({ error: '創建記錄失敗' });
      }
    });
    
    stream.end(req.file.buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '上傳失敗' });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const userRole = req.user.role;
    
    let list;
    if (userRole === 'admin' && userId) {
      list = await getRecordingsByUser(userId);
    } else if (userRole === 'admin' && !userId) {
      list = await getAllRecordings();
    } else if ((userRole === 'teacher' || userRole === 'parent') && !userId) {
      list = await getAllRecordings();
    } else if ((userRole === 'teacher' || userRole === 'parent') && userId) {
      list = await getRecordingsByUser(userId);
    } else {
      list = await getRecordingsByUser(req.user.id);
    }
    
    res.json(list.map((r) => ({ ...r, audioUrl: `/storage/${r.filename}` })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '取得錄音失敗' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rec = await getRecordingById(id);
    if (!rec) return res.status(404).json({ error: '找不到錄音' });
    
    const userRole = req.user.role;
    if (userRole === 'teacher' || userRole === 'parent') {
      return res.status(403).json({ error: '老師/家長無權限刪除錄音' });
    }
    
    const isAdmin = userRole === 'admin';
    if (!isAdmin && rec.user_id !== req.user.id) {
      return res.status(403).json({ error: '無法刪除他人的錄音' });
    }
    
    // 刪除 Firebase Storage 中的文件
    const bucket = storage.bucket();
    const file = bucket.file(`recordings/${rec.filename}`);
    await file.delete().catch(() => {}); // 忽略文件不存在的錯誤
    
    await dbDeleteRecording(id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '刪除失敗' });
  }
});

export { router as recordingsRouter };
