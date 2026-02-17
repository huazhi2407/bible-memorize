# 現在部署到 Render

## ✅ GitHub 推送成功！

看到 "Everything up-to-date" 表示代碼已成功推送到 GitHub。

## 🚀 下一步：在 Render 部署

### 步驟 1：在 Render 選擇倉庫

1. **返回 Render Dashboard**
2. **在 "New Web Service" 頁面**：
   - 應該已經在 "Source Code" 步驟
   - 選擇 "**Git Provider**"
   - 在倉庫列表中，選擇 **`bible-memorize`**

### 步驟 2：基本設置

點擊 "Next" 或繼續到設置頁面，配置：

- **Name**: `bible-memorize-firebase`
- **Region**: 選擇離您最近的區域（例如：Singapore）
- **Branch**: `main`

### 步驟 3：構建和啟動設置（最重要！）

- **Root Directory**: `server-firebase` ⚠️ **必須設置！**
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 步驟 4：設置環境變量

在 "Environment Variables" 部分，添加：

#### 4.1 FIREBASE_SERVICE_ACCOUNT（最重要）

1. **Key**: `FIREBASE_SERVICE_ACCOUNT`
2. **Value**: 
   - 打開 `server-firebase/firebase-service-account.json`
   - 複製整個 JSON 內容
   - **轉換為單行**（移除所有換行符）
   - 貼上到 Render

**格式示例**：
```
{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}
```

#### 4.2 其他環境變量

- **NODE_ENV**: `production`
- **PORT**: `10000`（Render 會自動設置，但可以明確指定）
- **JWT_SECRET**: `your-random-secret-string` ⚠️ **必須更改為隨機字符串！**
- **ADMIN_PASSWORD**: `your-secure-password`（可選）

### 步驟 5：創建服務

1. 點擊「**Create Web Service**」
2. 等待部署完成（通常 2-5 分鐘）
3. 記下服務 URL，例如：`https://bible-memorize-firebase.onrender.com`

## 📋 部署檢查清單

- [ ] 在 Render 選擇 `bible-memorize` 倉庫
- [ ] Root Directory 設置為 `server-firebase`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] `FIREBASE_SERVICE_ACCOUNT` 環境變量已設置（JSON 單行）
- [ ] `NODE_ENV` 設置為 `production`
- [ ] `JWT_SECRET` 已更改為隨機字符串
- [ ] 服務創建成功
- [ ] 部署完成並運行

## 🧪 測試部署

部署完成後：

1. **訪問服務 URL**：`https://your-service-url.onrender.com`
2. **測試 API**：
   ```bash
   curl https://your-service-url.onrender.com/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"admin\",\"password\":\"admin123\"}"
   ```

## 🔗 下一步：更新前端

部署成功後，需要更新前端配置：

1. **在 Vercel 設置環境變量**：
   - Key: `VITE_API_BASE`
   - Value: `https://your-render-url.onrender.com`

2. **重新部署前端**

## ⚠️ 常見問題

### 問題：構建失敗

**檢查**：
- Root Directory 是否為 `server-firebase`
- `package.json` 是否存在

### 問題：啟動失敗

**檢查**：
- `FIREBASE_SERVICE_ACCOUNT` 格式是否正確
- 查看 Render 日誌

### 問題：Firestore 連接失敗

**檢查**：
- Cloud Firestore API 已啟用
- 服務帳戶權限正確

## 💡 提示

1. **Root Directory 最重要**：必須是 `server-firebase`
2. **環境變量格式**：`FIREBASE_SERVICE_ACCOUNT` 必須是有效的 JSON 字符串
3. **查看日誌**：在 Render Dashboard → Logs 查看詳細日誌

## 🎉 完成後

部署成功後，您的應用將：
- ✅ 後端運行在 Render
- ✅ 前端運行在 Vercel
- ✅ 數據存儲在 Firebase Firestore
- ✅ 文件存儲在 Firebase Storage

現在可以在 Render 中選擇 `bible-memorize` 倉庫並開始部署了！
