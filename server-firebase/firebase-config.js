import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 初始化 Firebase Admin SDK
let initialized = false;
let _storageBucketName = null;

export function initFirebase() {
  if (initialized) return;

  try {
    let serviceAccount;
    
    // 方式 1: 使用環境變量中的服務帳號 JSON
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    // 方式 2: 使用服務帳號文件路徑
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH.startsWith('/') 
        ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        : join(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
    // 方式 3: 使用默認的服務帳號文件
    else {
      const defaultPath = join(__dirname, 'firebase-service-account.json');
      if (fs.existsSync(defaultPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
      } else {
        throw new Error('Firebase 服務帳號未配置。請設置 FIREBASE_SERVICE_ACCOUNT 環境變量或提供 firebase-service-account.json 文件。');
      }
    }

    // Storage Bucket：環境變量 > .firebasestorage.app（新專案預設）> .appspot.com（舊專案預設）
    const projectId = serviceAccount.project_id;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET ||
      (projectId + '.firebasestorage.app');

    // 初始化 Firebase Admin SDK
    // 注意：確保項目 ID 正確，Firestore 與 Storage 皆已啟用
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket,
      projectId,
    });

    initialized = true;
    _storageBucketName = storageBucket;
    console.log('Firebase Admin SDK 初始化成功');
    console.log('項目 ID:', projectId);
    console.log('Storage Bucket:', storageBucket);
  } catch (error) {
    console.error('Firebase 初始化失敗:', error);
    throw error;
  }
}

// 使用 getter 函數確保在初始化後才訪問
export function getDb() {
  if (!initialized) {
    throw new Error('Firebase 尚未初始化，請先調用 initFirebase()');
  }
  // 返回默認 Firestore 實例
  return admin.firestore();
}

export function getStorage() {
  if (!initialized) {
    throw new Error('Firebase 尚未初始化，請先調用 initFirebase()');
  }
  return admin.storage();
}

/** 取得目前設定的 Storage bucket 名稱（用於明確指定 bucket） */
export function getStorageBucketName() {
  if (!initialized || !_storageBucketName) {
    throw new Error('Firebase 尚未初始化，請先調用 initFirebase()');
  }
  return _storageBucketName;
}

export function getAuth() {
  if (!initialized) {
    throw new Error('Firebase 尚未初始化，請先調用 initFirebase()');
  }
  return admin.auth();
}

// 為了向後兼容，也導出直接訪問的版本（但需要在初始化後使用）
export const db = new Proxy({}, {
  get(target, prop) {
    return getDb()[prop];
  }
});

export const storage = new Proxy({}, {
  get(target, prop) {
    return getStorage()[prop];
  }
});

export const auth = new Proxy({}, {
  get(target, prop) {
    return getAuth()[prop];
  }
});
