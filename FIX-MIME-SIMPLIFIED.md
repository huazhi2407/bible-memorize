# 修復 MIME Type 錯誤（簡化方案）

## 🔍 問題分析

錯誤訊息：`Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

**根本原因**：
- Vercel 的 rewrites 規則可能過於複雜
- 根據 Vercel 文檔，**Vercel 會自動處理靜態資源文件**，在應用 rewrites 之前會先檢查文件是否存在
- 如果文件存在，直接返回文件內容；如果不存在，才應用 rewrites

## ✅ 已修復

### 1. 簡化 Vercel 配置

**修復**：
- ✅ 使用最簡單的 rewrites 規則：`/(.*)` → `/index.html`
- ✅ Vercel 會自動處理靜態資源，不需要複雜的正則表達式排除
- ✅ 確保構建輸出配置正確

### 2. 優化 Vite 構建配置

**修復**：
- ✅ 明確設置 `assetsDir: 'assets'`
- ✅ 配置輸出文件名格式，確保資源文件在 `/assets/` 目錄下
- ✅ 使用 hash 文件名，確保緩存正確

## 🧪 測試步驟

1. **等待 Vercel 重新部署**：
   - 修復已推送到 GitHub
   - Vercel 會自動重新部署（約 1-2 分鐘）

2. **清除所有緩存**（重要）：
   - **清除瀏覽器緩存**：按 `Ctrl + Shift + R` 強制刷新
   - **清除 Service Worker**：
     - 按 `F12` 打開開發者工具
     - 前往「Application」標籤
     - 左側找到「Service Workers」
     - 點擊「Unregister」
     - 左側找到「Cache Storage」
     - 刪除所有緩存
   - **或使用無痕模式**：`Ctrl + Shift + N`

3. **測試前端**：
   - 訪問您的 Vercel URL
   - 檢查是否還有 MIME type 錯誤
   - 查看瀏覽器控制台
   - 確認 JavaScript 文件正確加載

## 🔍 驗證修復

### 檢查 1：確認構建輸出

在 Vercel Dashboard → Deployments → 最新部署：
1. 查看構建日誌
2. 確認 `dist` 目錄包含：
   - `index.html`
   - `assets/` 目錄（包含 JavaScript 和 CSS 文件）

### 檢查 2：直接訪問資源文件

在瀏覽器中直接訪問：
```
https://your-site.vercel.app/assets/index-xxxxx.js
```

- ✅ **如果返回 JavaScript 代碼**：配置正確
- ❌ **如果返回 HTML**：仍有問題，需要進一步檢查
- ❌ **如果返回 404**：構建問題

### 檢查 3：檢查 Network 標籤

1. 按 `F12` 打開開發者工具
2. 前往「Network」標籤
3. 刷新頁面
4. 找到 JavaScript 文件請求（如 `index-xxxxx.js`）
5. 檢查：
   - **Status Code**：應該是 200
   - **Content-Type**：應該是 `application/javascript` 或 `text/javascript`
   - **Response**：應該是 JavaScript 代碼，不是 HTML

## 📋 檢查清單

- [ ] 修復已推送到 GitHub
- [ ] Vercel 重新部署完成
- [ ] 清除瀏覽器緩存
- [ ] 清除 Service Worker 緩存
- [ ] 測試前端
- [ ] 確認沒有 MIME type 錯誤
- [ ] 確認 JavaScript 文件正確加載
- [ ] 確認 Content-Type 正確

## 💡 Vercel 工作原理

根據 Vercel 文檔：

1. **文件存在性檢查**：Vercel 首先檢查請求的路徑是否存在實際文件
2. **靜態資源優先**：如果文件存在（如 `/assets/index-xxx.js`），直接返回文件內容
3. **SPA 路由**：如果文件不存在（如 `/login`），才應用 rewrites 規則，重定向到 `/index.html`

因此，**不需要複雜的正則表達式來排除資源文件**，Vercel 會自動處理。

## 🆘 如果問題持續

如果修復後仍有問題，請檢查：

1. **Vercel 構建日誌**：
   - 確認構建成功
   - 確認 `dist/assets/` 目錄包含 JavaScript 文件

2. **Vercel 項目設置**：
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **清除 Vercel 緩存**：
   - Vercel Dashboard → Settings
   - 找到「Clear Build Cache」
   - 清除緩存並重新部署

4. **檢查構建輸出**：
   - 在本地運行 `npm run build`
   - 檢查 `dist` 目錄結構
   - 確認 `dist/assets/` 包含 JavaScript 文件

## 🎉 完成後

如果所有錯誤都解決了：
- ✅ JavaScript 文件正確加載
- ✅ Content-Type 正確（`application/javascript`）
- ✅ 沒有 MIME type 錯誤
- ✅ SPA 路由正常工作
- ✅ 應用功能正常
