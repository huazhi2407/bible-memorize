# Firebase 後端部署指南

## 概述

這個版本使用 Firebase 作為後端：
- **Firestore** - 數據庫（替代 SQLite）
- **Firebase Storage** - 文件存儲（存儲錄音文件）
- **Firebase Admin SDK** - 服務器端操作

## 優點

✅ **無需管理服務器** - Firebase 是完全託管的  
✅ **自動擴展** - 根據使用量自動擴展  
✅ **實時同步** - Firestore 支持實時數據同步  
✅ **免費額度** - Firebase 免費計劃足夠個人項目使用  
✅ **全球 CDN** - 文件通過 CDN 分發，速度快  

## 設置步驟

### 1. 創建 Firebase 項目

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「添加項目」
3. 輸入項目名稱（例如：`bible-memorize`）
4. 啟用 Google Analytics（可選）
5. 創建項目

### 2. 啟用 Firestore Database

1. 在 Firebase Console 中，點擊「Firestore Database」
2. 點擊「創建數據庫」
3. 選擇「以測試模式啟動」（開發時）
4. 選擇數據庫位置（建議選擇離用戶最近的區域）
5. 啟用數據庫

### 3. 啟用 Firebase Storage

1. 在 Firebase Console 中，點擊「Storage」
2. 點擊「開始使用」
3. 選擇「以測試模式啟動」
4. 使用與 Firestore 相同的位置
5. 啟用 Storage

### 4. 創建服務帳號

1. 在 Firebase Console 中，點擊項目設置（齒輪圖標）
2. 選擇「服務帳戶」標籤
3. 點擊「生成新的私密金鑰」
4. 下載 JSON 文件（例如：`firebase-service-account.json`）
5. **重要**：將此文件放在 `server-firebase/` 目錄中

### 5. 設置 Firestore 安全規則

在 Firebase Console → Firestore Database → 規則中，設置：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許讀寫（生產環境應該設置更嚴格的規則）
    match /{document=**} {
      allow read, write: if request.auth != null || request.auth == null;
    }
  }
}
```

**注意**：這是測試規則，生產環境應該設置更嚴格的權限。

### 6. 設置 Storage 安全規則

在 Firebase Console → Storage → 規則中，設置：

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

### 7. 安裝依賴

```bash
cd server-firebase
npm install
```

### 8. 配置環境變量

創建 `.env` 文件或設置環境變量：

```bash
# 方式 1: 使用服務帳號文件路徑
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# 方式 2: 使用環境變量（JSON 字符串）
# FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# 其他環境變量
NODE_ENV=production
PORT=3001
ADMIN_PASSWORD=admin123
```

### 9. 運行服務器

```bash
npm start
# 或開發模式
npm run dev
```

## 部署到雲服務

### 部署到 Render

1. 創建新的 Web Service
2. Root Directory: `server-firebase`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 添加環境變量：
   - `FIREBASE_SERVICE_ACCOUNT`: （將 JSON 文件內容作為字符串）

### 部署到 Vercel（使用 Serverless Functions）

可以將 Express 應用轉換為 Vercel Serverless Functions，但需要調整代碼結構。

### 部署到 Firebase Functions（推薦）

Firebase Functions 是運行 Node.js 後端的理想選擇：

1. 安裝 Firebase CLI：
   ```bash
   npm install -g firebase-tools
   ```

2. 初始化 Firebase Functions：
   ```bash
   firebase init functions
   ```

3. 將 `server-firebase` 的代碼複製到 `functions/` 目錄

4. 部署：
   ```bash
   firebase deploy --only functions
   ```

## 數據遷移

如果需要從 SQLite 遷移到 Firestore：

1. 導出 SQLite 數據
2. 編寫遷移腳本將數據導入 Firestore
3. 測試數據完整性

## 成本估算

Firebase 免費計劃（Spark Plan）包括：
- Firestore: 50K 讀取/天，20K 寫入/天
- Storage: 5GB 存儲，1GB/天 下載
- Functions: 125K 調用/月

對於個人項目，免費計劃通常足夠。如果超出，可以升級到 Blaze Plan（按使用量付費）。

## 注意事項

1. **安全規則**：生產環境必須設置嚴格的 Firestore 和 Storage 安全規則
2. **索引**：某些查詢可能需要創建複合索引，Firebase 會提示
3. **數據備份**：定期導出 Firestore 數據作為備份
4. **文件大小**：注意 Firebase Storage 的文件大小限制

## 與原版本的差異

- ✅ 數據庫從 SQLite 改為 Firestore
- ✅ 文件存儲從本地文件系統改為 Firebase Storage
- ✅ 所有數據操作改為異步（async/await）
- ✅ 文件上傳直接到 Firebase Storage，不經過本地磁盤

## 故障排除

### Firebase 初始化失敗
- 檢查服務帳號 JSON 文件是否正確
- 檢查環境變量是否正確設置

### 權限錯誤
- 檢查 Firestore 和 Storage 的安全規則
- 確保服務帳號有足夠的權限

### 查詢錯誤
- 檢查是否需要創建複合索引
- 查看 Firebase Console 中的錯誤提示
