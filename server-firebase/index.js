import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initFirebase, storage, getStorageBucketName } from './firebase-config.js';
import { hasAnyUser, createUser, getRecordingByFilename } from './db-firebase.js';
import { authMiddleware } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { recordingsRouter } from './routes/recordings.js';
import { usersRouter } from './routes/users.js';
import { checkinsRouter } from './routes/checkins.js';
import { scripturePlansRouter } from './routes/scripture-plans.js';
import { approvalsRouter } from './routes/approvals.js';
import { pointsRouter } from './routes/points.js';

// 初始化 Firebase
initFirebase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 文件下載代理（從 Firebase Storage）- 需要身份驗證
// 支持 Authorization header 或 token query parameter（用於 <audio> 標籤）
app.get('/storage/:filename', async (req, res) => {
  try {
    // 檢查身份驗證（從 Authorization header 或 query token）
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: '需要身份驗證' });
    }
    
    // 驗證 token
    try {
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'bible-memorize-secret-change-in-production';
      const payload = jwt.default.verify(token, JWT_SECRET);
      const { findUserById } = await import('./db-firebase.js');
      const user = await findUserById(payload.userId);
      if (!user) {
        return res.status(401).json({ error: '使用者不存在' });
      }
      req.user = user;
    } catch (authError) {
      return res.status(401).json({ error: '無效的身份驗證令牌' });
    }
    
    const { filename } = req.params;
    const bucket = storage.bucket(getStorageBucketName());
    const file = bucket.file(`recordings/${filename}`);
    
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 檢查權限：學生只能訪問自己的錄音，管理員/老師/家長可以訪問所有錄音
    if (req.user.role === 'student') {
      const recording = await getRecordingByFilename(filename);
      if (!recording || recording.user_id !== req.user.id) {
        return res.status(403).json({ error: '無權限訪問此文件' });
      }
    }
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 3600000, // 1小時有效
    });
    
    res.redirect(url);
  } catch (error) {
    console.error('文件下載錯誤:', error);
    res.status(500).json({ error: '文件下載失敗' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/scripture-plans', scripturePlansRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/points', pointsRouter);

// 全局錯誤處理（捕獲未處理的錯誤）
app.use((err, req, res, next) => {
  console.error('未處理的錯誤:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: '伺服器錯誤: ' + (err.message || String(err)) });
  }
});

// 初始化數據庫和預設管理員
async function start() {
  try {
    // 測試 Firestore 連接
    console.log('正在測試 Firestore 連接...');
    const hasUsers = await hasAnyUser();
    console.log('Firestore 連接成功！');
    
    if (!hasUsers) {
      try {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        await createUser('admin', adminPassword, 'admin');
        console.log('已建立預設管理員：帳號 admin，密碼 ' + (process.env.ADMIN_PASSWORD ? '(env)' : 'admin123'));
      } catch (createError) {
        console.error('創建預設管理員失敗:', createError);
        throw createError;
      }
    } else {
      console.log('數據庫中已有用戶，跳過創建預設管理員');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('\n❌ 啟動失敗！');
    console.error('錯誤:', err.message);
    console.error('錯誤代碼:', err.code || 'N/A');
    
    if (err.code === 5 || err.message.includes('NOT_FOUND')) {
      console.error('\n🔍 Firestore 連接問題診斷：');
      console.error('\n可能的原因：');
      console.error('1. ❌ Firestore 數據庫未創建');
      console.error('   → 前往 Firebase Console → Firestore Database → 創建數據庫');
      console.error('');
      console.error('2. ❌ 創建為 Datastore 模式（錯誤）');
      console.error('   → 必須使用 Firestore (Native mode)，不是 Datastore');
      console.error('   → 如果創建錯誤，需要刪除後重新創建');
      console.error('');
      console.error('3. ❌ 數據庫位置不匹配');
      console.error('   → 檢查服務帳號中的項目 ID 是否正確');
      console.error('   → 確認數據庫位置與服務帳號區域一致');
      console.error('');
      console.error('4. ❌ 服務帳號權限不足');
      console.error('   → 確認服務帳號有 Firestore 權限');
      console.error('   → 重新生成服務帳號 JSON 文件');
      console.error('');
      console.error('📋 檢查步驟：');
      console.error('1. 前往 https://console.firebase.google.com/');
      console.error('2. 選擇您的項目');
      console.error('3. 前往 Firestore Database');
      console.error('4. 確認數據庫已創建且顯示為 "Firestore"（不是 "Datastore"）');
      console.error('5. 如果顯示 "Datastore"，請刪除後重新創建，選擇 "Firestore"');
      console.error('6. 確認數據庫位置正確');
      console.error('7. 重新下載服務帳號 JSON 文件');
      console.error('\n詳細說明請參考：server-firebase/README.md 或 server-firebase/SETUP.md\n');
    }
    process.exit(1);
  }
}

start();
