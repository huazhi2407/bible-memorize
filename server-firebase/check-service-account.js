import 'dotenv/config';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔍 檢查服務帳戶配置\n');

// 讀取服務帳戶文件
let serviceAccount;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
  ? (process.env.FIREBASE_SERVICE_ACCOUNT_PATH.startsWith('/') 
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      : join(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH))
  : join(__dirname, 'firebase-service-account.json');

try {
  const content = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(content);
  console.log('✅ 服務帳戶文件讀取成功\n');
} catch (error) {
  console.error('❌ 無法讀取服務帳戶文件:', error.message);
  process.exit(1);
}

console.log('📋 服務帳戶信息：');
console.log('   項目 ID:', serviceAccount.project_id);
console.log('   客戶端電子郵件:', serviceAccount.client_email);
console.log('   客戶端 ID:', serviceAccount.client_id);
console.log('   私鑰 ID:', serviceAccount.private_key_id);
console.log('   類型:', serviceAccount.type);
console.log('');

// 檢查是否為 Firebase Admin SDK 服務帳戶
const isFirebaseAdminSDK = serviceAccount.client_email.includes('firebase-adminsdk');
console.log('🔍 服務帳戶類型檢查：');
if (isFirebaseAdminSDK) {
  console.log('   ✅ 這是 Firebase Admin SDK 服務帳戶');
} else {
  console.log('   ⚠️  這不是標準的 Firebase Admin SDK 服務帳戶');
  console.log('   📝 Firebase Admin SDK 服務帳戶通常格式為：');
  console.log('      firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com');
  console.log('   📝 當前服務帳戶：', serviceAccount.client_email);
  console.log('');
  console.log('   💡 建議：');
  console.log('      1. 前往 Firebase Console → 項目設置 → 服務帳戶');
  console.log('      2. 點擊「生成新的私密金鑰」');
  console.log('      3. 下載 Firebase Admin SDK 專用的服務帳戶 JSON 文件');
}

console.log('\n📋 下一步檢查：');
console.log('   1. 確認 Cloud Firestore API 已啟用');
console.log('   2. 確認服務帳戶有 Cloud Datastore User 角色');
console.log('   3. 確認項目 ID 匹配：', serviceAccount.project_id);
