# Firebase 遷移指南

## 快速開始

### 1. 複製路由文件

將以下文件從 `server/routes/` 複製到 `server-firebase/routes/`：
- `auth.js`
- `users.js`
- `checkins.js`
- `scripture-plans.js`
- `approvals.js`
- `points.js`

### 2. 修改導入語句

在所有路由文件中，將：
```javascript
import { ... } from '../db/index.js';
```

改為：
```javascript
import { ... } from '../db-firebase.js';
```

### 3. 將同步函數改為異步

所有數據庫操作都需要使用 `await`：

**原代碼**：
```javascript
const user = findUserById(id);
```

**Firebase 版本**：
```javascript
const user = await findUserById(id);
```

### 4. 複製中間件

將 `server/middleware/auth.js` 複製到 `server-firebase/middleware/auth.js`，無需修改。

## 完整遷移步驟

### 步驟 1: 設置 Firebase

1. 創建 Firebase 項目
2. 啟用 Firestore 和 Storage
3. 下載服務帳號 JSON 文件
4. 將文件放在 `server-firebase/` 目錄

### 步驟 2: 安裝依賴

```bash
cd server-firebase
npm install
```

### 步驟 3: 配置環境變量

創建 `.env` 文件：
```
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
NODE_ENV=production
PORT=3001
ADMIN_PASSWORD=admin123
```

### 步驟 4: 複製並修改路由文件

參考上面的「快速開始」部分。

### 步驟 5: 測試

```bash
npm start
```

訪問 http://localhost:3001 測試功能。

## 主要變更

1. **所有數據庫操作都是異步的**
2. **文件上傳直接到 Firebase Storage**
3. **文件下載通過簽名 URL**
4. **ID 使用 Firestore 自動生成的文檔 ID**

## 需要幫助？

如果遇到問題，請檢查：
1. Firebase 服務帳號是否正確配置
2. Firestore 和 Storage 是否已啟用
3. 安全規則是否正確設置
4. 所有異步操作是否使用了 `await`
