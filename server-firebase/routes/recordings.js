import { Router } from 'express';
import multer from 'multer';
import { storage, getStorageBucketName } from '../firebase-config.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import {
  createRecording,
  getRecordingsByUser,
  getRecordingsByUserIds,
  getAllRecordings,
  getRecordingById,
  deleteRecording as dbDeleteRecording,
  listStudents,
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

router.post('/', (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      console.error('Multer 錯誤:', err);
      return res.status(400).json({ error: err.message || '只接受 webm 音檔' });
    }
    next();
  });
}, async (req, res) => {
  let responseSent = false;
  const sendError = (status, message) => {
    if (responseSent) return;
    responseSent = true;
    res.status(status).json({ error: message });
  };
  const sendSuccess = (data) => {
    if (responseSent) return;
    responseSent = true;
    res.status(201).json(data);
  };

  try {
    if (!req.file) return sendError(400, '未收到音檔');

    const filename = `${uuidv4()}.webm`;
    let bucket;
    try {
      const bucketName = getStorageBucketName();
      bucket = storage.bucket(bucketName);
    } catch (storageErr) {
      console.error('Storage bucket 錯誤:', storageErr);
      return sendError(500, '儲存服務未就緒');
    }
    const file = bucket.file(`recordings/${filename}`);

    const stream = file.createWriteStream({
      metadata: { contentType: 'audio/webm' },
    });

    stream.on('error', (error) => {
      console.error('Storage 上傳錯誤:', error);
      const msg = error.message || (error.code === 404 ? 'Storage 儲存區不存在，請在 Firebase Console 啟用 Storage' : '儲存服務錯誤');
      sendError(500, '上傳失敗: ' + msg);
    });

    stream.on('finish', async () => {
      try {
        const id = await createRecording(req.user.id, filename);
        sendSuccess({
          id,
          filename,
          audioUrl: `/storage/${filename}`,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('創建記錄錯誤:', error);
        sendError(500, '創建記錄失敗: ' + (error.message || String(error)));
      }
    });

    stream.end(req.file.buffer);
  } catch (e) {
    console.error('錄音上傳異常:', e);
    sendError(500, '上傳失敗: ' + (e.message || String(e)));
  }
});

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登入' });
    }
    const requestedUserId = req.query.userId;
    const userRole = req.user.role;
    let list;
    if (requestedUserId && (userRole === 'admin' || userRole === 'teacher' || userRole === 'parent')) {
      // 查詢指定學生的錄音
      list = await getRecordingsByUser(requestedUserId);
    } else if (userRole === 'admin') {
      // admin 不帶 userId：返回所有錄音（管理後台需要）
      list = await getAllRecordings();
    } else {
      // 其他角色：只返回自己的錄音
      list = await getRecordingsByUser(req.user.id);
    }
    res.json(list.map((r) => ({ ...r, audioUrl: `/storage/${r.filename}` })));
  } catch (e) {
    console.error('取得錄音失敗:', e);
    console.error('錯誤詳情:', e.message, e.stack);
    res.status(500).json({ error: '取得錄音失敗: ' + (e.message || String(e)) });
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
    const bucket = storage.bucket(getStorageBucketName());
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
