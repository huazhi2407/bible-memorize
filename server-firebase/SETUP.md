# Firebase 設置指南

這是一個完整的 Firebase 設置指南，幫助您快速設置和部署 Firebase 後端。

## 📋 檢查清單

- [ ] Firebase 項目已創建
- [ ] Firestore Database 已啟用
- [ ] Firebase Storage 已啟用
- [ ] 服務帳號 JSON 文件已下載
- [ ] Firestore 安全規則已設置
- [ ] Storage 安全規則已設置
- [ ] 環境變量已配置
- [ ] 本地測試成功
- [ ] 後端已部署

## 🚀 步驟 1: 創建 Firebase 項目

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「添加項目」
3. 輸入項目名稱（例如：`bible-memorize`）
4. 啟用 Google Analytics（可選，建議關閉）
5. 點擊「創建項目」

## 🗄️ 步驟 2: 啟用 Firestore Database

1. 在 Firebase Console 左側選單，點擊「Firestore Database」
2. 點擊「創建數據庫」
3. 選擇「以測試模式啟動」（開發時）或「以生產模式啟動」（生產環境）
4. 選擇數據庫位置（建議選擇離您最近的區域，如 `asia-east1`）
5. 點擊「啟用」

### 設置 Firestore 安全規則

1. 在 Firestore Database 頁面，點擊「規則」標籤
2. 複製 `firestore.rules` 文件的內容
3. 貼上到規則編輯器
4. 點擊「發布」

**生產環境推薦**：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 📦 步驟 3: 啟用 Firebase Storage

1. 在 Firebase Console 左側選單，點擊「Storage」
2. 點擊「開始使用」
3. 選擇「以測試模式啟動」或「以生產模式啟動」
4. 使用與 Firestore 相同的位置
5. 點擊「完成」

### 設置 Storage 安全規則

1. 在 Storage 頁面，點擊「規則」標籤
2. 複製 `storage.rules` 文件的內容
3. 貼上到規則編輯器
4. 點擊「發布」

**推薦規則**：
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /recordings/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔑 步驟 4: 下載服務帳號文件

1. 點擊 Firebase Console 右上角的「⚙️ 項目設置」
2. 選擇「服務帳戶」標籤
3. 點擊「生成新的私密金鑰」
4. 確認下載
5. 將下載的 JSON 文件重命名為 `firebase-service-account.json`
6. **將文件放在 `server-firebase/` 目錄中**

⚠️ **重要**：不要將此文件提交到 Git！

## ⚙️ 步驟 5: 配置環境變量

1. 在 `server-firebase/` 目錄中，複製 `.env.example` 為 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 編輯 `.env` 文件：
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   NODE_ENV=production
   PORT=3001
   ADMIN_PASSWORD=admin123
   JWT_SECRET=bible-memorize-secret-change-in-production
   ```

## 🧪 步驟 6: 本地測試

1. 安裝依賴：
   ```bash
   cd server-firebase
   npm install
   ```

2. 運行服務器：
   ```bash
   npm start
   ```

3. 應該看到：
   ```
   Firebase Admin SDK 初始化成功
   已建立預設管理員：帳號 admin，密碼 admin123
   Server running at http://localhost:3001
   ```

4. 測試 API：
   ```bash
   curl http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"name":"admin","password":"admin123"}'
   ```

## 🚢 步驟 7: 部署到 Render

### 7.1 創建 Render 服務

1. 前往 https://render.com
2. 註冊/登入帳號
3. 點擊「New +」→「Web Service」
4. 連接你的 GitHub 倉庫
5. 設置：
   - **Name**: `bible-memorize-firebase`
   - **Root Directory**: `server-firebase`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free（或 Starter $7/月）

### 7.2 設置環境變量

在 Render Dashboard → Environment Variables，添加：

1. **FIREBASE_SERVICE_ACCOUNT**
   - 打開 `firebase-service-account.json` 文件
   - 複製整個 JSON 內容（包括大括號）
   - 在 Render 中添加環境變量，值為整個 JSON 字符串
   - ⚠️ 注意：JSON 必須在一行內，所有引號需要轉義

2. **NODE_ENV**: `production`
3. **PORT**: `10000`（Render 會自動設置）
4. **ADMIN_PASSWORD**: 自定義管理員密碼（可選）
5. **JWT_SECRET**: 隨機字符串（必須更改！）

### 7.3 部署

點擊「Create Web Service」，等待部署完成。

部署完成後，記下後端 URL，例如：`https://bible-memorize-firebase.onrender.com`

## 🔗 步驟 8: 連接前端

### 更新 Vercel 環境變量

在 Vercel Dashboard → 你的項目 → Settings → Environment Variables：

添加：
- **Key**: `VITE_API_BASE`
- **Value**: `https://your-backend-url.onrender.com`（替換為你的 Render 後端 URL）

### 重新部署前端

在 Vercel Dashboard → Deployments → 點擊最新的部署 → 「Redeploy」

或推送代碼到 GitHub，Vercel 會自動重新部署。

## ✅ 完成

現在您的應用已經完全設置好：

- ✅ 前端：Vercel（靜態網站）
- ✅ 後端：Render（Firebase 後端）
- ✅ 數據庫：Firestore
- ✅ 文件存儲：Firebase Storage
- ✅ 手機可以使用：PWA 支持

## 🐛 常見問題

### Firebase 初始化失敗

- 檢查服務帳號 JSON 文件路徑是否正確
- 檢查環境變量是否正確設置
- 確認 Firestore 和 Storage 已啟用

### Firestore 查詢失敗（NOT_FOUND）

- 確認 Firestore Database 已創建並啟用
- 檢查數據庫位置是否正確

### 文件上傳失敗

- 檢查 Firebase Storage 是否已啟用
- 檢查 Storage 安全規則是否正確
- 確認文件大小不超過限制（25MB）

### API 請求失敗（401）

- 檢查 JWT token 是否有效
- 確認 `JWT_SECRET` 環境變量與生成 token 時一致

## 📚 相關文檔

- [Firebase 官方文檔](https://firebase.google.com/docs)
- [Firestore 安全規則](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage 規則](https://firebase.google.com/docs/storage/security)
- [Render 部署文檔](https://render.com/docs)
