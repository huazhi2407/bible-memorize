# 修復 Service Worker 攔截資源文件問題

## 🔍 問題分析

錯誤訊息：`Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

**根本原因**：
- Service Worker 的 `fetch` 事件監聽器攔截了**所有**請求，包括 `/assets/` 下的 JavaScript 文件
- 當 Service Worker 嘗試從緩存或網絡獲取資源文件時，如果返回 HTML（由於 rewrites），會導致 MIME type 錯誤
- Service Worker 應該**不攔截**資源文件請求，讓瀏覽器直接從服務器獲取

## ✅ 已修復

### 修改 Service Worker

**修復**：
- ✅ Service Worker 現在**不攔截** `/assets/` 路徑下的請求
- ✅ 只處理 HTML 頁面（`/`, `/index.html`）和 `manifest.json`
- ✅ 對於其他請求（包括 API 調用），直接從網絡獲取，不經過緩存
- ✅ 更新緩存版本號（v2 → v3），強制清除舊緩存

## 🧪 測試步驟

1. **等待 Vercel 重新部署**：
   - 修復已推送到 GitHub
   - Vercel 會自動重新部署（約 1-2 分鐘）

2. **清除所有緩存**（**必須執行**）：
   - **清除 Service Worker**：
     - 按 `F12` 打開開發者工具
     - 前往「Application」標籤
     - 左側找到「Service Workers」
     - 點擊「Unregister」（取消註冊）
     - 左側找到「Cache Storage」
     - 刪除所有緩存
   - **清除瀏覽器緩存**：
     - 按 `Ctrl + Shift + R` 強制刷新
     - 或使用無痕模式（`Ctrl + Shift + N`）

3. **測試前端**：
   - 訪問您的 Vercel URL
   - 檢查是否還有 MIME type 錯誤
   - 查看瀏覽器控制台
   - 確認 JavaScript 文件正確加載

## 🔍 驗證修復

### 檢查 1：確認 Service Worker 已更新

1. 按 `F12` 打開開發者工具
2. 前往「Application」標籤
3. 左側找到「Service Workers」
4. 確認版本是 `bible-memorize-v3`（不是 v2）

### 檢查 2：確認資源文件不被攔截

1. 按 `F12` 打開開發者工具
2. 前往「Network」標籤
3. 刷新頁面
4. 找到 JavaScript 文件請求（如 `index-xxxxx.js`）
5. 檢查：
   - **Status Code**：應該是 200
   - **Content-Type**：應該是 `application/javascript`
   - **Size**：應該顯示實際文件大小（不是 HTML 的大小）
   - **Response**：應該是 JavaScript 代碼，不是 HTML

### 檢查 3：確認 Service Worker 行為

在瀏覽器控制台運行：
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
  registrations.forEach(reg => {
    console.log('Scope:', reg.scope);
    console.log('Active:', reg.active);
  });
});
```

## 📋 檢查清單

- [ ] 修復已推送到 GitHub
- [ ] Vercel 重新部署完成
- [ ] **清除 Service Worker**（重要！）
- [ ] **清除 Cache Storage**（重要！）
- [ ] 清除瀏覽器緩存
- [ ] 測試前端
- [ ] 確認沒有 MIME type 錯誤
- [ ] 確認 JavaScript 文件正確加載
- [ ] 確認 Service Worker 版本是 v3

## 💡 Service Worker 最佳實踐

1. **不攔截資源文件**：
   - 資源文件（JS、CSS、圖片）應該直接從服務器獲取
   - 這些文件通常有 hash 文件名，可以長期緩存

2. **只緩存 HTML**：
   - 只緩存 HTML 頁面，用於離線訪問
   - 資源文件由瀏覽器和 CDN 緩存

3. **更新緩存版本**：
   - 每次修改 Service Worker，更新版本號
   - 強制清除舊緩存

## 🆘 如果問題持續

如果清除緩存後仍有問題：

1. **完全禁用 Service Worker**（臨時測試）：
   - 在 `client/src/main.jsx` 中註釋掉 Service Worker 註冊代碼
   - 重新部署
   - 如果問題解決，說明是 Service Worker 問題
   - 如果問題仍在，說明是其他問題

2. **檢查 Vercel 構建輸出**：
   - 確認 `dist/assets/` 目錄包含 JavaScript 文件
   - 確認文件大小正常（不是 HTML 的大小）

3. **檢查 Network 請求**：
   - 確認資源文件的請求 URL 正確
   - 確認響應內容是 JavaScript 代碼

## 🎉 完成後

如果所有錯誤都解決了：
- ✅ JavaScript 文件正確加載
- ✅ Content-Type 正確（`application/javascript`）
- ✅ 沒有 MIME type 錯誤
- ✅ Service Worker 正常工作（不攔截資源文件）
- ✅ 應用功能正常
