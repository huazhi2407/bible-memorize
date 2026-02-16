import 'dotenv/config';
import { initFirebase, getDb } from './firebase-config.js';

async function testFirebase() {
  console.log('🔍 Firebase 連接診斷工具\n');
  
  try {
    // 初始化 Firebase
    console.log('1. 初始化 Firebase Admin SDK...');
    initFirebase();
    console.log('   ✅ Firebase Admin SDK 初始化成功\n');
    
    // 測試 Firestore 連接
    console.log('2. 測試 Firestore 連接...');
    const db = getDb();
    
    // 嘗試讀取一個不存在的集合（這會觸發連接測試）
    try {
      const testRef = db.collection('_test_connection');
      await testRef.limit(1).get();
      console.log('   ✅ Firestore 連接成功\n');
    } catch (error) {
      console.error('   ❌ Firestore 連接失敗');
      console.error('   錯誤代碼:', error.code);
      console.error('   錯誤訊息:', error.message);
      console.error('   錯誤詳情:', error.details || '無');
      
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.error('\n   🔍 診斷：');
        console.error('   這通常表示 Firestore 數據庫未創建或配置錯誤。');
        console.error('\n   📋 請檢查：');
        console.error('   1. Firebase Console → Firestore Database');
        console.error('   2. 確認數據庫已創建');
        console.error('   3. 確認使用的是 "Firestore" (Native mode)，不是 "Datastore"');
        console.error('   4. 如果顯示 "Datastore"，請刪除後重新創建，選擇 "Firestore"');
        console.error('   5. 確認數據庫位置正確（例如：asia-east1）');
        console.error('   6. 重新下載服務帳號 JSON 文件\n');
      }
      process.exit(1);
    }
    
    // 測試寫入權限
    console.log('3. 測試 Firestore 寫入權限...');
    try {
      const testDoc = db.collection('_test_connection').doc('test');
      await testDoc.set({ test: true, timestamp: new Date() });
      await testDoc.delete();
      console.log('   ✅ Firestore 寫入權限正常\n');
    } catch (error) {
      console.error('   ⚠️  Firestore 寫入權限問題');
      console.error('   錯誤:', error.message);
      console.error('   這可能不影響應用運行（如果使用 Admin SDK）\n');
    }
    
    // 顯示項目信息
    console.log('4. 項目信息：');
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require('fs').readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json', 'utf8');
    const account = typeof serviceAccount === 'string' ? JSON.parse(serviceAccount) : serviceAccount;
    console.log('   項目 ID:', account.project_id);
    console.log('   服務帳號:', account.client_email);
    console.log('   Storage Bucket:', account.project_id + '.appspot.com\n');
    
    console.log('✅ 所有測試通過！Firebase 配置正確。\n');
    
  } catch (error) {
    console.error('\n❌ 診斷失敗：');
    console.error('錯誤:', error.message);
    console.error('堆疊:', error.stack);
    process.exit(1);
  }
}

testFirebase();
