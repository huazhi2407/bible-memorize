# 重新生成 Firebase 服務帳戶

## 🔍 問題

服務帳戶 `firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com` 在 Google Cloud Console 中找不到。

## 💡 解決方案：重新生成服務帳戶

### 方法 1：從 Firebase Console 重新生成（推薦）

1. **前往 Firebase Console**
   - 鏈接：https://console.firebase.google.com/project/bible-memorize-38d24/settings/serviceaccounts/adminsdk

2. **生成新的私密金鑰**
   - 在「Firebase Admin SDK」部分
   - 選擇「Node.js」
   - 點擊「生成新的私密金鑰」
   - 確認下載

3. **替換服務帳戶文件**
   - 將下載的 JSON 文件重命名為 `firebase-service-account.json`
   - 替換 `server-firebase/firebase-service-account.json` 文件

4. **測試連接**
   ```bash
   cd server-firebase
   node test-firestore-direct.js
   ```

### 方法 2：從 Google Cloud Console 創建

1. **前往 Google Cloud Console**
   - 鏈接：https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24

2. **創建服務帳戶**
   - 點擊「+ 創建服務帳戶」
   - 名稱：`firebase-admin`（或任何名稱）
   - 點擊「創建並繼續」

3. **授予角色**
   - 在「授予此服務帳戶對項目的訪問權限」部分
   - 添加角色：
     - `Cloud Datastore User`
     - `Firebase Admin SDK Administrator Service Agent`
   - 點擊「繼續」→「完成」

4. **創建密鑰**
   - 點擊新創建的服務帳戶
   - 點擊「密鑰」標籤
   - 點擊「添加密鑰」→「創建新密鑰」
   - 選擇「JSON」
   - 下載文件

5. **替換服務帳戶文件**
   - 將下載的 JSON 文件重命名為 `firebase-service-account.json`
   - 替換 `server-firebase/firebase-service-account.json` 文件

## ⚠️ 重要提示

1. **不要刪除舊的服務帳戶文件**（先備份）
2. **確保新服務帳戶有正確的權限**
3. **測試連接後再刪除舊文件**

## 🔗 直接鏈接

**Firebase Console（推薦）：**
https://console.firebase.google.com/project/bible-memorize-38d24/settings/serviceaccounts/adminsdk

**Google Cloud Console：**
https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24

## 🧪 測試步驟

重新生成服務帳戶後：

1. **檢查服務帳戶文件**
   ```bash
   cd server-firebase
   node check-service-account.js
   ```

2. **測試 Firestore 連接**
   ```bash
   node test-firestore-direct.js
   ```

3. **如果成功，啟動服務器**
   ```bash
   npm start
   ```

## 📋 檢查清單

- [ ] 從 Firebase Console 下載新的服務帳戶 JSON
- [ ] 替換 `firebase-service-account.json` 文件
- [ ] 確認服務帳戶有 `Cloud Datastore User` 角色
- [ ] 測試 Firestore 連接成功
- [ ] 服務器可以正常啟動
