# 部署前端到 Vercel - 完整指南

## 🎯 目標

將 React 前端部署到 Vercel，連接到 Render 後端。

## 📋 步驟 1：登入 Vercel

1. **前往 Vercel**：https://vercel.com/
2. **登入**：
   - 點擊「**Sign Up**」或「**Log In**」
   - 選擇「**Continue with GitHub**」（推薦）
   - 授權 Vercel 訪問您的 GitHub 帳號

## 📋 步驟 2：創建新項目

### 2.1 導入項目

1. 在 Vercel Dashboard，點擊「**Add New...**」→「**Project**」
2. 或點擊「**New Project**」按鈕

### 2.2 選擇倉庫

1. 在倉庫列表中，找到並選擇 **`bible-memorize`**
2. 點擊「**Import**」

## 📋 步驟 3：配置項目設置

### 3.1 基本設置

在 "Configure Project" 頁面：

- **Project Name**: `bible-memorize`（或您喜歡的名稱）
- **Framework Preset**: `Vite`（應該自動檢測到）
- **Root Directory**: `client` ⚠️ **必須設置！**

### 3.2 構建設置（應該自動填充）

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 環境變量設置

在 "Environment Variables" 部分：

#### 添加 VITE_API_BASE

1. 點擊「**Add Environment Variable**」
2. **Key**: `VITE_API_BASE`
3. **Value**: 
   - 如果 Render 後端已部署：`https://your-render-url.onrender.com`
   - 如果還沒部署：可以先設置為 `http://localhost:3001`，之後再更新
4. **Environment**: 
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. 點擊「**Add**」

## 📋 步驟 4：部署

1. 點擊「**Deploy**」按鈕
2. 等待構建完成（通常 1-2 分鐘）
3. 構建完成後，會顯示部署 URL，例如：`https://bible-memorize.vercel.app`

## 📋 步驟 5：驗證部署

### 5.1 訪問前端

在瀏覽器訪問 Vercel 提供的 URL，應該看到登入頁面。

### 5.2 測試功能

1. **測試登入**：
   - 帳號：`admin`
   - 密碼：`admin123`

2. **如果後端還沒部署**：
   - 會看到連接錯誤（這是正常的）
   - 等後端部署完成後再測試

3. **如果後端已部署**：
   - 應該可以正常登入
   - 測試所有功能

## 📋 步驟 6：更新環境變量（如果後端已部署）

如果之前設置為 `http://localhost:3001`，現在需要更新：

1. **Vercel Dashboard** → 您的項目 → **Settings** → **Environment Variables**
2. **找到** `VITE_API_BASE`
3. **編輯** → 更新 Value 為您的 Render 後端 URL
4. **保存**
5. **重新部署**：
   - 前往 **Deployments**
   - 點擊最新的部署
   - 點擊「**Redeploy**」
   - 確認使用最新的環境變量

## ✅ 檢查清單

### 部署前
- [ ] Vercel 帳號已創建/登入
- [ ] GitHub 帳號已連接
- [ ] 已選擇 `bible-memorize` 倉庫

### 配置
- [ ] Root Directory 設置為 `client` ⚠️ **最重要！**
- [ ] Framework Preset 為 `Vite`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] 環境變量 `VITE_API_BASE` 已設置

### 部署後
- [ ] 部署成功
- [ ] 前端可以訪問
- [ ] 可以連接後端（如果後端已部署）
- [ ] 所有功能正常

## 🔗 快速鏈接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **創建新項目**: https://vercel.com/new
- **GitHub 倉庫**: https://github.com/huazhi2407/bible-memorize

## 💡 重要提示

1. **Root Directory 必須是 `client`**：
   - 這是 Vercel 構建前端的地方
   - 如果設置錯誤，會找不到文件

2. **環境變量必須以 `VITE_` 開頭**：
   - Vite 只會讀取以 `VITE_` 開頭的環境變量
   - 所以使用 `VITE_API_BASE` 而不是 `API_BASE`

3. **自動部署**：
   - 每次推送到 GitHub 的 `main` 分支，Vercel 會自動重新部署
   - Pull Request 會創建預覽部署

4. **免費方案**：
   - Vercel 免費方案足夠使用
   - 包含無限部署和帶寬

## 🆘 常見問題

### 問題：構建失敗

**可能原因**：
- Root Directory 設置錯誤
- 構建命令錯誤
- 依賴安裝失敗

**解決**：
- 確認 Root Directory 為 `client`
- 檢查構建日誌
- 確認 `package.json` 存在

### 問題：找不到文件

**解決**：
- 確認 Root Directory 為 `client`
- 確認文件結構正確

### 問題：無法連接後端

**解決**：
- 確認 `VITE_API_BASE` 環境變量正確
- 確認 Render 後端正在運行
- 確認 CORS 配置正確

## 📝 部署後續

部署成功後：

1. **記下 Vercel URL**：例如 `https://bible-memorize.vercel.app`
2. **測試前端功能**
3. **確認可以連接後端**（如果後端已部署）
4. **分享給用戶使用**

## 🎉 完成後

您的應用將：
- ✅ 前端運行在 Vercel（快速、全球 CDN）
- ✅ 後端運行在 Render（如果已部署）
- ✅ 數據存儲在 Firebase Firestore
- ✅ 文件存儲在 Firebase Storage
- ✅ 可以從任何地方訪問

現在可以前往 Vercel 創建項目了！
