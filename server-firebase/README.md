# Firebase 後端版本

這是使用 Firebase 作為後端的版本，使用 Firestore 作為數據庫，Firebase Storage 作為文件存儲。

## 📋 目錄結構

```
server-firebase/
├── index.js                    # 主服務器文件
├── firebase-config.js          # Firebase 初始化配置
├── db-firebase.js              # Firestore 數據庫操作
├── middleware/
│   └── auth.js                # JWT 身份驗證中間件
├── routes/                     # API 路由
│   ├── auth.js                # 登入/註冊
│   ├── recordings.js          # 錄音管理
│   ├── users.js               # 用戶管理
│   ├── checkins.js            # 簽到管理
│   ├── scripture-plans.js     # 經文計劃
│   ├── approvals.js           # 確認管理
│   └── points.js              # 積分管理
├── firestore.rules            # Firestore 安全規則
├── storage.rules              # Storage 安全規則
├── .env.example               # 環境變量示例
├── package.json               # 依賴配置
└── README.md                  # 本文件
```

## 🚀 快速開始

### 1. 設置 Firebase 項目

#### 1.1 創建 Firebase 項目

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「添加項目」
3. 輸入項目名稱（例如：`bible-memorize`）
4. 啟用 Google Analytics（可選，建議關閉）
5. 點擊「創建項目」

#### 1.2 啟用 Firestore Database

1. 在 Firebase Console 左側選單，點擊「Firestore Database」
2. 點擊「創建數據庫」
3. 選擇「以測試模式啟動」（開發時）或「以生產模式啟動」（生產環境）
4. 選擇數據庫位置（建議選擇離您最近的區域，如 `asia-east1`）
5. 點擊「啟用」

#### 1.3 啟用 Firebase Storage

1. 在 Firebase Console 左側選單，點擊「Storage」
2. 點擊「開始使用」
3. 選擇「以測試模式啟動」或「以生產模式啟動」
4. 使用與 Firestore 相同的位置
5. 點擊「完成」

#### 1.4 下載服務帳號文件

1. 點擊 Firebase Console 右上角的「⚙️ 項目設置」
2. 選擇「服務帳戶」標籤
3. 點擊「生成新的私密金鑰」
4. 確認下載
5. 將下載的 JSON 文件重命名為 `firebase-service-account.json`
6. **將文件放在 `server-firebase/` 目錄中**

⚠️ **重要**：不要將此文件提交到 Git！已包含在 `.gitignore` 中。

### 2. 配置安全規則

#### 2.1 Firestore 規則

在 Firebase Console → Firestore Database → 規則，複製 `firestore.rules` 文件的內容並發布。

**生產環境推薦規則**（拒絕所有直接訪問，所有操作通過後端 API）：

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

**開發/測試模式**（允許已認證用戶訪問）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 2.2 Storage 規則

在 Firebase Console → Storage → 規則，複製 `storage.rules` 文件的內容並發布。

### 3. 安裝依賴

```bash
cd server-firebase
npm install
```

### 4. 配置環境變量

複製 `.env.example` 為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 文件：

```bash
# Firebase 服務帳號配置
# 方式 1: 使用文件路徑（本地開發推薦）
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# 方式 2: 使用環境變量（部署時使用）
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# 服務器配置
NODE_ENV=production
PORT=3001

# 管理員密碼（可選，默認為 admin123）
ADMIN_PASSWORD=admin123

# JWT 密鑰（生產環境請更改為隨機字符串）
JWT_SECRET=bible-memorize-secret-change-in-production
```

### 5. 運行服務器

```bash
# 開發模式（自動重啟）
npm run dev

# 生產模式
npm start
```

應該看到：
```
Firebase Admin SDK 初始化成功
Server running at http://localhost:3001
```

## 🔐 安全說明

### Admin SDK vs 安全規則

此應用使用 **Firebase Admin SDK**，它擁有完整的數據庫和存儲權限，**繞過所有安全規則**。

- ✅ **優點**：所有權限檢查在後端 API 中進行，更靈活和安全
- ⚠️ **注意**：Firestore 和 Storage 規則主要作為**額外防禦層**，防止直接客戶端訪問

### 推薦設置

**生產環境**：
- Firestore 規則：`allow read, write: if false;`（拒絕所有直接訪問）
- Storage 規則：`allow write: if false;`（禁止直接寫入）

**開發環境**：
- 可以使用較寬鬆的規則進行測試，但建議仍設置基本認證要求

## 📦 部署

### 部署到 Render

1. 創建新的 Web Service
2. 連接 GitHub 倉庫
3. 設置：
   - **Root Directory**: `server-firebase`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. 環境變量：
   - `FIREBASE_SERVICE_ACCOUNT`: 將整個 JSON 文件內容作為字符串
   - `NODE_ENV`: `production`
   - `PORT`: `10000`（Render 自動設置）
   - `ADMIN_PASSWORD`: 自定義管理員密碼（可選）
   - `JWT_SECRET`: 隨機字符串（必須更改）

### 部署到 Firebase Functions

```bash
npm install -g firebase-tools
firebase login
firebase init functions
# 選擇現有項目或創建新項目
# 將代碼複製到 functions/ 目錄
cd functions
npm install
firebase deploy --only functions
```

## 📊 數據結構

### Firestore 集合

- **users**: 用戶資料（name, password_hash, role, points, number）
- **recordings**: 錄音記錄（user_id, filename, created_at）
- **checkins**: 簽到記錄（user_id, date）
- **scripture_plans**: 經文計劃（year, week, segments[]）
- **approvals**: 確認記錄（student_id, approver_id, date）
- **points_history**: 積分歷史（user_id, points, reason, date）

### Storage 結構

- **recordings/**: 所有錄音文件（webm 格式）

## 🔧 API 端點

所有 API 端點都需要 JWT 身份驗證（`Authorization: Bearer <token>`）。

- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `GET /api/users` - 獲取用戶列表
- `POST /api/recordings` - 上傳錄音
- `GET /api/recordings` - 獲取錄音列表
- `DELETE /api/recordings/:id` - 刪除錄音
- `POST /api/checkins` - 簽到
- `GET /api/checkins` - 獲取簽到記錄
- `GET /api/scripture-plans` - 獲取經文計劃
- `POST /api/scripture-plans` - 創建/更新經文計劃
- `POST /api/approvals` - 確認學生合格
- `GET /api/points/me` - 獲取自己的積分
- `POST /api/points/adjust` - 調整積分

詳細文檔請參考各路由文件。

## ⚠️ 注意事項

1. **免費額度**：Firebase 免費計劃通常足夠個人項目使用
2. **安全規則**：生產環境必須設置嚴格的安全規則
3. **索引**：某些查詢可能需要創建複合索引（Firebase 會提示）
4. **服務帳號**：不要將服務帳號文件提交到 Git
5. **JWT_SECRET**：生產環境必須更改為隨機字符串

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

## 🔄 與原版本的差異

- ✅ 數據庫：SQLite → Firestore
- ✅ 文件存儲：本地文件系統 → Firebase Storage
- ✅ 所有操作都是異步的（`async/await`）
- ✅ 文件通過簽名 URL 訪問
- ✅ 支持雲端部署和擴展
