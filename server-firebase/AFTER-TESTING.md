# 測試完成後的步驟

## ✅ 測試完成確認

如果所有功能測試通過，接下來可以：

## 🎯 步驟 1：設置生產環境配置

### 1.1 更新 Firestore 安全規則（生產環境）

在 Firebase Console → Firestore Database → 規則，設置生產環境規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 生產環境：拒絕所有直接訪問，只通過 Admin SDK
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**為什麼這樣設置？**
- 您的應用使用 Firebase Admin SDK，會繞過安全規則
- 設置 `if false` 可以防止直接客戶端訪問
- 所有操作都通過後端 API，更安全

### 1.2 更新 Storage 安全規則

在 Firebase Console → Storage → 規則：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /recordings/{allPaths=**} {
      allow read: if true;  // 通過後端 API 提供簽名 URL
      allow write: if false;  // 禁止直接寫入
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🚀 步驟 2：準備部署（可選）

### 2.1 部署到 Render

#### 創建 Render 服務

1. 前往 https://render.com
2. 註冊/登入帳號
3. 點擊「New +」→「Web Service」
4. 連接您的 GitHub 倉庫
5. 設置：
   - **Name**: `bible-memorize-firebase`
   - **Root Directory**: `server-firebase`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free（或 Starter $7/月）

#### 設置環境變量

在 Render Dashboard → Environment Variables，添加：

1. **FIREBASE_SERVICE_ACCOUNT**
   - 打開 `firebase-service-account.json`
   - 複製整個 JSON 內容（一行）
   - 在 Render 中添加環境變量，值為整個 JSON 字符串

2. **NODE_ENV**: `production`
3. **PORT**: `10000`（Render 會自動設置）
4. **ADMIN_PASSWORD**: 自定義管理員密碼（可選）
5. **JWT_SECRET**: 隨機字符串（必須更改！）

#### 部署

點擊「Create Web Service」，等待部署完成。

部署完成後，記下後端 URL，例如：`https://bible-memorize-firebase.onrender.com`

### 2.2 更新前端配置

#### 更新 Vercel 環境變量

在 Vercel Dashboard → 您的項目 → Settings → Environment Variables：

添加：
- **Key**: `VITE_API_BASE`
- **Value**: `https://your-backend-url.onrender.com`（替換為您的 Render 後端 URL）

#### 重新部署前端

在 Vercel Dashboard → Deployments → 點擊最新的部署 → 「Redeploy」

或推送代碼到 GitHub，Vercel 會自動重新部署。

## 📋 步驟 3：日常使用

### 3.1 啟動應用（本地開發）

```bash
# 啟動後端
cd server-firebase
npm start

# 啟動前端（另一個終端）
cd client
npm run dev
```

### 3.2 訪問應用

- **本地開發**：http://localhost:5173
- **生產環境**：您的 Vercel URL

### 3.3 預設管理員

- **帳號**：`admin`
- **密碼**：`admin123`（或您設置的 `ADMIN_PASSWORD`）

**⚠️ 重要**：首次登入後，建議：
1. 創建新的管理員帳號
2. 刪除或修改預設管理員密碼

## 🔧 步驟 4：維護和監控

### 4.1 監控 Firebase 使用量

1. 前往 Firebase Console → 使用量和帳單
2. 監控：
   - Firestore 讀取/寫入次數
   - Storage 存儲空間
   - 網絡傳輸量

### 4.2 定期備份

1. **Firestore 數據備份**：
   - Firebase Console → Firestore Database → 匯出
   - 或使用 Firebase CLI：`firebase firestore:export`

2. **Storage 文件備份**：
   - 定期下載重要錄音文件

### 4.3 檢查日誌

1. **後端日誌**：
   - 本地：終端輸出
   - Render：Dashboard → Logs

2. **Firebase 日誌**：
   - Firebase Console → 使用量和帳單 → 使用量

## 📝 步驟 5：文檔整理

### 5.1 記錄重要信息

創建 `DEPLOYMENT-INFO.md` 記錄：

```markdown
# 部署信息

## Firebase 項目
- 項目 ID: ________________
- 項目名稱: ________________

## Firestore
- 位置: ________________
- 規則: 生產模式

## Storage
- 位置: ________________
- 規則: 生產模式

## 部署
- 後端 URL: ________________
- 前端 URL: ________________

## 服務帳戶
- 電子郵件: ________________
- 創建日期: ________________

## 環境變量
- JWT_SECRET: ________________（已設置）
- ADMIN_PASSWORD: ________________（已設置）
```

### 5.2 更新 README

更新 `server-firebase/README.md`，記錄：
- 部署 URL
- 環境變量設置
- 常見問題

## ✅ 完成檢查清單

### 開發環境
- [ ] 所有功能測試通過
- [ ] 本地開發環境正常運行
- [ ] 前端可以連接後端

### 生產環境
- [ ] Firestore 規則設置為生產模式
- [ ] Storage 規則設置為生產模式
- [ ] 環境變量已設置
- [ ] JWT_SECRET 已更改為隨機字符串
- [ ] ADMIN_PASSWORD 已設置（如需要）

### 部署（如需要）
- [ ] 後端已部署到 Render
- [ ] 前端已部署到 Vercel
- [ ] 環境變量已正確設置
- [ ] 生產環境測試通過

### 安全
- [ ] 預設管理員密碼已更改
- [ ] JWT_SECRET 已更改
- [ ] 安全規則已設置
- [ ] 服務帳戶文件未提交到 Git

## 🎉 恭喜！

您的應用已經準備就緒！現在可以：

1. **開始使用**：使用您的經文背誦應用
2. **繼續開發**：添加新功能或改進
3. **部署上線**：部署到生產環境供他人使用
4. **監控維護**：定期檢查使用量和性能

## 📚 相關文檔

- `README.md` - 完整文檔
- `SETUP.md` - 設置指南
- `NEXT-STEPS-AFTER-SUCCESS.md` - 成功後的步驟
- `DEPLOYMENT.md` - 部署指南（如需要）

## 💡 提示

1. **開發階段**：使用寬鬆的規則便於測試
2. **生產環境**：必須設置嚴格的安全規則
3. **定期備份**：定期備份 Firestore 數據
4. **監控使用量**：關注 Firebase 使用量，避免超出免費額度
5. **安全第一**：確保所有敏感信息（JWT_SECRET、服務帳戶）都已正確保護

## 🆘 需要幫助？

如果遇到問題，請檢查：
- `TROUBLESHOOTING.md` - 常見問題排查
- `FIX-PERMISSION-DENIED.md` - 權限問題修復
- Firebase Console 日誌
- Render/Vercel 部署日誌
