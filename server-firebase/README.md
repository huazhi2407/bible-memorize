---
title: Bible Memorize API
emoji: 📖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
---

# 經文背誦 API 後端

這是經文背誦應用的後端 API 服務，使用 Firebase Firestore 作為數據庫，Firebase Storage 作為文件存儲。

## 功能

- **註冊 / 登入**：用戶認證和授權
- **錄音管理**：上傳、下載、刪除錄音文件
- **簽到系統**：週曆簽到功能
- **用戶管理**：管理員可以管理用戶
- **經文計劃**：管理經文背誦計劃
- **積分系統**：用戶積分管理

## 環境變量

在 HuggingFace Spaces 的 Settings → Variables and secrets 中設置以下環境變量：

### 必需變量

- `FIREBASE_SERVICE_ACCOUNT`: Firebase 服務帳號 JSON（整個 JSON 作為字符串）
- `PORT`: 服務器端口（默認為 7860）

### 可選變量

- `NODE_ENV`: 環境模式（默認為 `production`）
- `ADMIN_PASSWORD`: 預設管理員密碼（默認為 `admin123`）
- `JWT_SECRET`: JWT 簽章密鑰（生產環境必須更改）
- `FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket 名稱（可選，會自動檢測）

## API 端點

所有 API 端點都需要 JWT 身份驗證（`Authorization: Bearer <token>`）。

### 認證
- `POST /api/auth/register` - 註冊新用戶
- `POST /api/auth/login` - 登入

### 錄音
- `POST /api/recordings` - 上傳錄音
- `GET /api/recordings` - 獲取錄音列表
- `DELETE /api/recordings/:id` - 刪除錄音

### 用戶
- `GET /api/users` - 獲取用戶列表（管理員）
- `DELETE /api/users/:id` - 刪除用戶（管理員）

### 簽到
- `POST /api/checkins` - 簽到
- `GET /api/checkins` - 獲取簽到記錄

### 經文計劃
- `GET /api/scripture-plans` - 獲取經文計劃
- `POST /api/scripture-plans` - 創建/更新經文計劃

### 積分
- `GET /api/points/me` - 獲取自己的積分
- `POST /api/points/adjust` - 調整積分（管理員）

## 設置步驟

1. **準備 Firebase 服務帳號**
   - 前往 Firebase Console → 項目設置 → 服務帳戶
   - 生成新的私密金鑰
   - 將整個 JSON 文件內容複製

2. **在 HuggingFace Spaces 設置環境變量**
   - 前往 Space Settings → Variables and secrets
   - 添加 `FIREBASE_SERVICE_ACCOUNT`，值為整個 JSON 字符串
   - 添加其他可選環境變量

3. **部署**
   - HuggingFace Spaces 會自動構建和部署
   - 等待構建完成後，訪問 Space URL

## 預設管理員

首次啟動時，如果數據庫中沒有用戶，會自動創建一個管理員帳號：
- 帳號：`admin`
- 密碼：`admin123`（或環境變量 `ADMIN_PASSWORD` 設定的值）

**重要**：首次登入後請立即修改密碼！

## 注意事項

- HuggingFace Spaces 免費方案有資源限制
- 文件上傳大小限制取決於 HuggingFace Spaces 的配置
- 建議使用 Firebase Storage 存儲大文件，而不是本地存儲

## 相關文檔

詳細設置說明請參考：
- `server-firebase/README.md` - 完整的設置指南
- `server-firebase/SETUP.md` - 逐步設置說明
