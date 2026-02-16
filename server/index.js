import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { initDb, hasAnyUser, createUser } from './db/index.js';
import { authRouter } from './routes/auth.js';
import { recordingsRouter } from './routes/recordings.js';
import { usersRouter } from './routes/users.js';
import { checkinsRouter } from './routes/checkins.js';
import { scripturePlansRouter } from './routes/scripture-plans.js';
import { approvalsRouter } from './routes/approvals.js';
import { pointsRouter } from './routes/points.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 在 Electron 打包環境中，使用用戶數據目錄
const isElectron = process.env.ELECTRON === 'true' || process.resourcesPath;
const userDataDir = process.env.USER_DATA_DIR || (isElectron ? path.join(homedir(), '.bible-memorize') : __dirname);

// 確保必要的目錄存在
const storageDir = path.join(userDataDir, 'storage');
const dataDir = path.join(userDataDir, 'data');
[storageDir, dataDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());
app.use('/storage', express.static(storageDir));
app.use('/api/auth', authRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/scripture-plans', scripturePlansRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/points', pointsRouter);

if (isProduction) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

async function start() {
  await initDb();
  if (!hasAnyUser()) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    createUser('admin', adminPassword, 'admin');
    console.log('已建立預設管理員：帳號 admin，密碼 ' + (process.env.ADMIN_PASSWORD ? '(env)' : 'admin123'));
  }
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('啟動失敗:', err);
  process.exit(1);
});
