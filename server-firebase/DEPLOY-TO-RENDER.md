# 部署 Firebase 後端到 Render

## 🎯 當前步驟

您正在 Render 創建新的 Web Service。以下是完整的部署配置步驟。

## 📋 步驟 1：選擇倉庫

在 Render 的 "Source Code" 頁面：

1. **選擇 Git Provider**（已選擇）
2. **選擇倉庫**：
   - 選擇包含 `bible-memorize` 項目的倉庫
   - 如果看到 `bible-devotion` 或 `church-verse-recitation-system`，選擇正確的倉庫

## 📋 步驟 2：基本設置

### 2.1 服務配置

在 "Settings" 頁面，設置：

- **Name**: `bible-memorize-firebase`（或您喜歡的名稱）
- **Region**: 選擇離您最近的區域（例如：Singapore）
- **Branch**: `main` 或 `master`（根據您的倉庫）

### 2.2 構建和啟動設置

- **Root Directory**: `server-firebase` ⚠️ **重要！**
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## 📋 步驟 3：設置環境變量

在 "Environment Variables" 部分，添加以下變量：

### 3.1 FIREBASE_SERVICE_ACCOUNT（最重要）

1. **Key**: `FIREBASE_SERVICE_ACCOUNT`
2. **Value**: 
   - 打開 `server-firebase/firebase-service-account.json`
   - 複製整個 JSON 內容
   - **重要**：必須在一行內，所有引號需要正確轉義
   - 或者使用在線工具將 JSON 轉換為單行字符串

**示例格式**：
```
{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}
```

### 3.2 其他環境變量

- **NODE_ENV**: `production`
- **PORT**: `10000`（Render 會自動設置，但可以明確指定）
- **ADMIN_PASSWORD**: `your-secure-password`（可選，自定義管理員密碼）
- **JWT_SECRET**: `your-random-secret-string` ⚠️ **必須更改為隨機字符串！**

## 📋 步驟 4：創建服務

1. 點擊「**Create Web Service**」
2. 等待部署完成（通常 2-5 分鐘）
3. 記下服務 URL，例如：`https://bible-memorize-firebase.onrender.com`

## 📋 步驟 5：測試部署

### 5.1 檢查服務狀態

1. 在 Render Dashboard，確認服務狀態為「**Live**」
2. 點擊服務 URL 查看是否正常運行

### 5.2 測試 API

```bash
# 測試健康檢查
curl https://your-service-url.onrender.com

# 測試登入 API
curl -X POST https://your-service-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"admin\",\"password\":\"admin123\"}"
```

## 📋 步驟 6：更新前端配置

### 6.1 更新 Vercel 環境變量

在 Vercel Dashboard → 您的項目 → Settings → Environment Variables：

1. 添加或更新：
   - **Key**: `VITE_API_BASE`
   - **Value**: `https://your-service-url.onrender.com`（您的 Render 後端 URL）

### 6.2 重新部署前端

1. 在 Vercel Dashboard → Deployments
2. 點擊最新的部署 → 「**Redeploy**」
3. 或推送代碼到 GitHub，Vercel 會自動重新部署

## ⚠️ 常見問題

### 問題 1：構建失敗

**可能原因**：
- Root Directory 設置錯誤
- 缺少依賴

**解決**：
- 確認 Root Directory 為 `server-firebase`
- 檢查 `server-firebase/package.json` 是否存在

### 問題 2：啟動失敗

**可能原因**：
- `FIREBASE_SERVICE_ACCOUNT` 環境變量格式錯誤
- Firebase 配置問題

**解決**：
- 確認 `FIREBASE_SERVICE_ACCOUNT` 是有效的 JSON 字符串
- 檢查 Render 日誌查看詳細錯誤

### 問題 3：Firestore 連接失敗

**可能原因**：
- 服務帳戶權限不足
- Firestore API 未啟用

**解決**：
- 確認 Cloud Firestore API 已啟用
- 確認服務帳戶有 `Cloud Datastore User` 角色

## 📝 部署檢查清單

- [ ] 倉庫已選擇
- [ ] Root Directory 設置為 `server-firebase`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] `FIREBASE_SERVICE_ACCOUNT` 環境變量已設置
- [ ] `NODE_ENV` 設置為 `production`
- [ ] `JWT_SECRET` 已更改為隨機字符串
- [ ] `ADMIN_PASSWORD` 已設置（可選）
- [ ] 服務部署成功並運行
- [ ] API 測試通過
- [ ] 前端環境變量已更新
- [ ] 前端重新部署完成

## 🔗 相關鏈接

- **Render Dashboard**: https://dashboard.render.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com/

## 💡 提示

1. **Root Directory 很重要**：必須設置為 `server-firebase`，否則會找不到文件
2. **環境變量格式**：`FIREBASE_SERVICE_ACCOUNT` 必須是有效的 JSON 字符串
3. **免費方案限制**：Render 免費方案在 15 分鐘無活動後會休眠，首次請求會較慢
4. **日誌查看**：在 Render Dashboard → Logs 查看詳細日誌

## 🎉 完成後

部署成功後，您的應用將：
- ✅ 後端運行在 Render
- ✅ 前端運行在 Vercel
- ✅ 數據存儲在 Firebase Firestore
- ✅ 文件存儲在 Firebase Storage
- ✅ 可以從任何地方訪問
