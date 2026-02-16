import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { processRecording } from '../services/speech.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const storageDir = path.join(__dirname, '..', 'storage');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    cb(null, `${id}.webm`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/webm' || file.originalname.endsWith('.webm')) {
      cb(null, true);
    } else {
      cb(new Error('只接受 webm 音檔'));
    }
  },
});

router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未收到音檔' });
    }
    const referenceText = (req.body.referenceText || '').trim();
    const webmPath = req.file.path;
    const fileId = path.basename(webmPath, '.webm');

    const result = await processRecording(webmPath, referenceText);

    const audioUrl = `/storage/${fileId}.webm`;

    res.json({
      audioUrl,
      text: result.text,
      correctedText: result.correctedText ?? undefined,
      accuracy: result.accuracy,
      referenceText: referenceText || undefined,
    });
  } catch (err) {
    console.error('Upload/process error:', err);
    res.status(500).json({
      error: err.message || '處理失敗',
    });
  }
});

export { router as uploadRouter };
