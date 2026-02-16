# 下一步操作指南

## 當前狀態

✅ 前端已部署到 Vercel  
✅ Firebase 後端代碼已準備好  
⏳ 需要設置 Firebase 項目並部署後端

## 步驟 1: 設置 Firebase 項目（5-10 分鐘）

### 1.1 創建 Firebase 項目

1. 前往 https://console.firebase.google.com/
2. 點擊「添加項目」
3. 輸入項目名稱（例如：`bible-memorize`）
4. 啟用 Google Analytics（可選，建議關閉）
5. 點擊「創建項目」

### 1.2 啟用 Firestore Database

1. 在 Firebase Console 左側選單，點擊「Firestore Database」
2. 點擊「創建數據庫」
3. 選擇「以測試模式啟動」（開發時）
4. 選擇數據庫位置（建議選擇離你最近的區域，如 `asia-east1`）
5. 點擊「啟用」

### 1.3 啟用 Firebase Storage

1. 在 Firebase Console 左側選單，點擊「Storage」
2. 點擊「開始使用」
3. 選擇「以測試模式啟動」
4. 使用與 Firestore 相同的位置
5. 點擊「完成」

### 1.4 下載服務帳號文件

1. 點擊 Firebase Console 右上角的「⚙️ 項目設置」
2. 選擇「服務帳戶」標籤
3. 點擊「生成新的私密金鑰」
4. 確認下載
5. 將下載的 JSON 文件重命名為 `firebase-service-account.json`
6. **將文件放在 `server-firebase/` 目錄中**

## 步驟 2: 配置 Firebase 安全規則

### 2.1 Firestore 規則

在 Firebase Console → Firestore Database → 規則，設置：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

點擊「發布」

### 2.2 Storage 規則

在 Firebase Console → Storage → 規則，設置：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /recordings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

點擊「發布」

## 步驟 3: 安裝並測試 Firebase 後端（本地）

```bash
cd server-firebase
npm install
```

創建 `.env` 文件：
```
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
NODE_ENV=production
PORT=3001
ADMIN_PASSWORD=admin123
```

測試運行：
```bash
npm start
```

應該看到：`Server running at http://localhost:3001`

## 步驟 4: 部署 Firebase 後端到 Render

### 4.1 創建 Render 服務

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

### 4.2 設置環境變量

在 Render Dashboard → Environment Variables，添加：

1. **FIREBASE_SERVICE_ACCOUNT**
   - 打開 `firebase-service-account.json` 文件
   - 複製整個 JSON 內容
   - 在 Render 中添加環境變量，值為整個 JSON 字符串

2. **NODE_ENV**: `production`
3. **PORT**: `10000`（Render 會自動設置，但可以明確指定）
4. **ADMIN_PASSWORD**: `admin123`（可選，自定義管理員密碼）

### 4.3 部署

點擊「Create Web Service」，等待部署完成。

部署完成後，記下後端 URL，例如：`https://bible-memorize-firebase.onrender.com`

## 步驟 5: 更新 Vercel 前端配置

### 5.1 設置環境變量

在 Vercel Dashboard → 你的項目 → Settings → Environment Variables：

添加：
- **Key**: `VITE_API_BASE`
- **Value**: `https://your-backend-url.onrender.com`（替換為你的 Render 後端 URL）

### 5.2 重新部署

在 Vercel Dashboard → Deployments → 點擊最新的部署 → 「Redeploy」

或推送代碼到 GitHub，Vercel 會自動重新部署。

## 步驟 6: 測試完整流程

1. 訪問 Vercel 前端 URL
2. 測試登入（預設管理員：`admin` / `admin123`）
3. 測試錄音上傳
4. 測試簽到功能
5. 測試積分功能

## 檢查清單

- [ ] Firebase 項目已創建
- [ ] Firestore Database 已啟用
- [ ] Firebase Storage 已啟用
- [ ] 服務帳號 JSON 文件已下載並放在 `server-firebase/` 目錄
- [ ] Firestore 安全規則已設置
- [ ] Storage 安全規則已設置
- [ ] Firebase 後端本地測試成功
- [ ] Render 後端已部署
- [ ] Vercel 環境變量 `VITE_API_BASE` 已設置
- [ ] Vercel 前端已重新部署
- [ ] 所有功能測試通過

## 遇到問題？

### Firebase 初始化失敗
- 檢查服務帳號 JSON 文件路徑是否正確
- 檢查環境變量是否正確設置

### API 請求失敗
- 檢查 `VITE_API_BASE` 環境變量是否正確
- 檢查 Render 後端是否正在運行
- 檢查 CORS 配置（後端已配置 `cors()`，應該沒問題）

### 文件上傳失敗
- 檢查 Firebase Storage 是否已啟用
- 檢查 Storage 安全規則是否正確

## 完成後

✅ 前端：Vercel（靜態網站）  
✅ 後端：Render（Firebase 後端）  
✅ 數據庫：Firestore  
✅ 文件存儲：Firebase Storage  
✅ 手機可以使用：PWA 支持

現在可以開始設置 Firebase 項目了！
