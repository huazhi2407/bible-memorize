# 設置 Firebase Admin SDK 服務帳戶權限

## 🔍 問題說明

Firebase Console 中可以看到服務帳戶 `firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com`，但在 Google Cloud Console 中找不到。這是**正常的**，因為：

1. Firebase Admin SDK 服務帳戶由 Firebase 自動管理
2. 可能不會直接顯示在 Google Cloud Console 的服務帳戶列表中
3. 權限需要通過 Firebase 或 IAM 設置

## ✅ 解決方案：通過 IAM 直接設置權限

### 方法 1：通過 IAM 頁面直接添加權限（推薦）

1. **前往 IAM 頁面**
   - 鏈接：https://console.cloud.google.com/iam-admin/iam?project=bible-memorize-38d24

2. **添加成員**
   - 點擊頁面頂部的「**授予訪問權限**」按鈕
   - 在「**新主體**」欄位中，輸入完整的服務帳戶電子郵件：
     ```
     firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com
     ```
   - 在「**選擇角色**」下拉菜單中，選擇：
     ```
     Cloud Datastore User
     ```
   - 點擊「**保存**」

3. **等待權限生效**
   - 通常需要 1-2 分鐘
   - 權限生效後，Firestore 連接應該可以正常工作

### 方法 2：通過 Firebase Console 重新生成（如果方法 1 無效）

1. **前往 Firebase Console**
   - 鏈接：https://console.firebase.google.com/project/bible-memorize-38d24/settings/serviceaccounts/adminsdk

2. **生成新的私密金鑰**
   - 點擊「**生成新的私密金鑰**」
   - 選擇「Node.js」
   - 下載 JSON 文件

3. **替換服務帳戶文件**
   - 將下載的文件重命名為 `firebase-service-account.json`
   - 替換 `server-firebase/firebase-service-account.json`

4. **測試連接**
   ```bash
   cd server-firebase
   node test-firestore-direct.js
   ```

## 🔗 直接鏈接

**IAM 頁面（添加權限）：**
https://console.cloud.google.com/iam-admin/iam?project=bible-memorize-38d24

**Firebase Console（重新生成）：**
https://console.firebase.google.com/project/bible-memorize-38d24/settings/serviceaccounts/adminsdk

## 📋 需要添加的角色

- ✅ `Cloud Datastore User`（必須）
- ✅ `Firebase Admin SDK Administrator Service Agent`（可選，但推薦）

## 🧪 測試步驟

添加權限後：

1. **等待 1-2 分鐘**讓權限生效

2. **測試 Firestore 連接**
   ```bash
   cd server-firebase
   node test-firestore-direct.js
   ```

3. **如果看到「✅ 方法 3 成功（寫入成功）」**，表示權限已正確設置

4. **啟動服務器**
   ```bash
   npm start
   ```

## ⚠️ 重要提示

1. **服務帳戶存在**：Firebase Console 顯示服務帳戶存在，這是正確的
2. **權限問題**：問題可能是權限不足，而不是服務帳戶不存在
3. **直接添加權限**：即使找不到服務帳戶，也可以通過 IAM 頁面直接添加權限
4. **等待生效**：添加權限後需要等待 1-2 分鐘

## 💡 為什麼 Google Cloud Console 找不到？

Firebase Admin SDK 服務帳戶是 Firebase 自動創建和管理的，可能：
- 不會顯示在標準的服務帳戶列表中
- 需要通過 IAM 頁面來管理權限
- 或者需要通過 Firebase Console 來重新生成

這不影響功能，只要權限正確設置即可。
