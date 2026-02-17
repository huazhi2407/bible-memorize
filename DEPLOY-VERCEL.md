# 部署前端到 Vercel

## 🎯 目標

將 React 前端部署到 Vercel，並連接到 Render 後端。

## 📋 步驟 1：在 Vercel 創建項目

### 1.1 登入 Vercel

1. **前往 Vercel**：https://vercel.com/
2. **登入**：使用 GitHub 帳號登入（推薦）

### 1.2 創建新項目

1. 點擊「**Add New...**」→「**Project**」
2. 或點擊「**New Project**」

### 1.3 選擇倉庫

1. **Import Git Repository**
2. 選擇 **`bible-memorize`** 倉庫
3. 點擊「**Import**」

## 📋 步驟 2：配置項目設置

### 2.1 基本設置

- **Project Name**: `bible-memorize`（或您喜歡的名稱）
- **Framework Preset**: `Vite`（應該自動檢測）
- **Root Directory**: `client` ⚠️ **重要！**

### 2.2 構建設置

- **Build Command**: `npm run build`（應該自動填充）
- **Output Directory**: `dist`（應該自動填充）
- **Install Command**: `npm install`（應該自動填充）

### 2.3 環境變量

在 "Environment Variables" 部分，添加：

- **Key**: `VITE_API_BASE`
- **Value**: `https://your-render-url.onrender.com`（您的 Render 後端 URL）
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**⚠️ 重要**：如果 Render 後端還沒部署，可以先設置為 `http://localhost:3001`，之後再更新。

## 📋 步驟 3：部署

1. 點擊「**Deploy**」
2. 等待構建完成（通常 1-2 分鐘）
3. 記下部署 URL，例如：`https://bible-memorize.vercel.app`

## 📋 步驟 4：驗證部署

### 4.1 訪問前端

在瀏覽器訪問 Vercel 提供的 URL，應該看到登入頁面。

### 4.2 測試功能

1. **登入**：
   - 帳號：`admin`
   - 密碼：`admin123`

2. **確認可以連接後端**：
   - 如果後端還沒部署，會看到連接錯誤
   - 如果後端已部署，應該可以正常登入

## 📋 步驟 5：更新環境變量（如果後端已部署）

如果之前設置為 `http://localhost:3001`，現在需要更新：

1. **Vercel Dashboard** → 您的項目 → **Settings** → **Environment Variables**
2. **編輯** `VITE_API_BASE`
3. **更新 Value** 為您的 Render 後端 URL
4. **保存**
5. **重新部署**：
   - Deployments → 最新部署 → 「**Redeploy**」

## ✅ 檢查清單

- [ ] Vercel 帳號已創建/登入
- [ ] 已選擇 `bible-memorize` 倉庫
- [ ] Root Directory 設置為 `client`
- [ ] Framework Preset 為 `Vite`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] 環境變量 `VITE_API_BASE` 已設置
- [ ] 部署成功
- [ ] 前端可以訪問
- [ ] 可以連接後端（如果後端已部署）

## 🔗 快速鏈接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **創建新項目**: https://vercel.com/new
- **Render Dashboard**: https://dashboard.render.com/

## 💡 提示

1. **Root Directory 很重要**：必須設置為 `client`，否則會找不到文件
2. **環境變量**：`VITE_API_BASE` 必須以 `VITE_` 開頭，Vite 才能讀取
3. **自動部署**：每次推送到 GitHub，Vercel 會自動重新部署
4. **預覽部署**：每次 Pull Request 會創建預覽部署

## 🆘 常見問題

### 問題：構建失敗

**檢查**：
- Root Directory 是否為 `client`
- `package.json` 是否存在
- 構建命令是否正確

### 問題：無法連接後端

**檢查**：
- `VITE_API_BASE` 環境變量是否正確
- Render 後端是否正在運行
- CORS 配置是否正確

### 問題：找不到文件

**檢查**：
- Root Directory 是否為 `client`
- 文件結構是否正確

## 📝 部署後

部署成功後：
1. 記下 Vercel URL
2. 測試前端功能
3. 確認可以連接後端
4. 分享給用戶使用

## 🎉 完成後

您的應用將：
- ✅ 前端運行在 Vercel
- ✅ 後端運行在 Render（如果已部署）
- ✅ 數據存儲在 Firebase Firestore
- ✅ 文件存儲在 Firebase Storage
- ✅ 可以從任何地方訪問

現在可以前往 Vercel 創建項目了！
