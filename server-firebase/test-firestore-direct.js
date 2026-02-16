import 'dotenv/config';
import { initFirebase, getDb } from './firebase-config.js';

async function testFirestoreDirect() {
  console.log('🔍 直接測試 Firestore 連接\n');
  
  try {
    // 初始化 Firebase
    console.log('1. 初始化 Firebase Admin SDK...');
    initFirebase();
    console.log('   ✅ 初始化成功\n');
    
    // 獲取 Firestore 實例
    console.log('2. 獲取 Firestore 實例...');
    const db = getDb();
    console.log('   ✅ Firestore 實例獲取成功\n');
    
    // 測試不同的連接方式
    console.log('3. 測試 Firestore 連接（多種方法）...\n');
    
    // 方法 1: 嘗試讀取一個不存在的文檔
    console.log('   方法 1: 讀取不存在的文檔...');
    try {
      const docRef = db.collection('_test').doc('connection');
      const doc = await docRef.get();
      console.log('   ✅ 方法 1 成功（文檔不存在是正常的）\n');
    } catch (error) {
      console.error('   ❌ 方法 1 失敗');
      console.error('   錯誤代碼:', error.code);
      console.error('   錯誤訊息:', error.message);
      console.error('   錯誤詳情:', error.details || '無');
      console.error('');
    }
    
    // 方法 2: 嘗試列出集合
    console.log('   方法 2: 列出集合...');
    try {
      const collections = await db.listCollections();
      console.log('   ✅ 方法 2 成功');
      console.log('   找到集合數量:', collections.length);
      if (collections.length > 0) {
        console.log('   集合列表:', collections.map(c => c.id).join(', '));
      }
      console.log('');
    } catch (error) {
      console.error('   ❌ 方法 2 失敗');
      console.error('   錯誤代碼:', error.code);
      console.error('   錯誤訊息:', error.message);
      console.error('   錯誤詳情:', error.details || '無');
      console.error('');
    }
    
    // 方法 3: 嘗試寫入測試文檔
    console.log('   方法 3: 寫入測試文檔...');
    try {
      const testRef = db.collection('_test').doc('connection');
      await testRef.set({
        test: true,
        timestamp: new Date(),
        message: 'Firestore connection test'
      });
      console.log('   ✅ 方法 3 成功（寫入成功）');
      
      // 清理測試文檔
      await testRef.delete();
      console.log('   ✅ 測試文檔已清理\n');
    } catch (error) {
      console.error('   ❌ 方法 3 失敗');
      console.error('   錯誤代碼:', error.code);
      console.error('   錯誤訊息:', error.message);
      console.error('   錯誤詳情:', error.details || '無');
      console.error('');
      
      // 詳細診斷
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.error('   🔍 詳細診斷：');
        console.error('   這個錯誤通常表示：');
        console.error('   1. Firestore 數據庫未正確初始化');
        console.error('   2. 服務帳戶權限不足');
        console.error('   3. Cloud Firestore API 未啟用（但您說已啟用）');
        console.error('   4. 數據庫位置不匹配');
        console.error('   5. 項目 ID 不匹配');
        console.error('');
        console.error('   💡 建議檢查：');
        console.error('   1. 確認 Cloud Firestore API 已啟用並等待幾分鐘');
        console.error('   2. 檢查服務帳戶權限：');
        console.error('      https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24');
        console.error('   3. 確認服務帳戶有 "Cloud Datastore User" 角色');
        console.error('   4. 嘗試重新下載服務帳戶 JSON 文件');
        console.error('');
      }
    }
    
    console.log('✅ 測試完成\n');
    
  } catch (error) {
    console.error('\n❌ 測試失敗：');
    console.error('錯誤:', error.message);
    console.error('堆疊:', error.stack);
    process.exit(1);
  }
}

testFirestoreDirect();
