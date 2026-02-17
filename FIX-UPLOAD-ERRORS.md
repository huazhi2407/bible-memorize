# 修復上傳失敗問題

## 🔍 問題分析

上傳失敗的可能原因：

1. **FormData Content-Type 問題**：
   - `fetchWithAuth` 可能錯誤地設置了 Content-Type
   - FormData 需要讓瀏覽器自動設置 `multipart/form-data`

2. **錯誤處理不足**：
   - 無法正確顯示錯誤訊息
   - 無法診斷具體失敗原因

3. **空文件檢查**：
   - 沒有檢查錄音文件是否為空

## ✅ 已修復

### 1. 修復 FormData 處理

在 `client/src/context/AuthContext.jsx`：
- ✅ 明確檢查 `opts.body instanceof FormData`
- ✅ 如果是 FormData，刪除手動設置的 Content-Type
- ✅ 讓瀏覽器自動設置正確的 `multipart/form-data` header

### 2. 改進錯誤處理

在 `client/src/pages/Home.jsx`：
- ✅ 添加空文件檢查
- ✅ 改進錯誤響應處理
- ✅ 添加詳細的錯誤訊息
- ✅ 添加控制台日誌以便調試

## 🧪 測試步驟

1. **清除瀏覽器緩存**：
   - 按 `Ctrl + Shift + R` 強制刷新
   - 或清除緩存後重新訪問

2. **測試上傳**：
   - 點擊「開始錄音」
   - 錄製一段音頻
   - 點擊「停止並儲存」
   - 觀察是否成功上傳

3. **檢查錯誤訊息**：
   - 如果失敗，查看顯示的錯誤訊息
   - 按 `F12` 打開開發者工具
   - 查看 Console 標籤的錯誤日誌
   - 查看 Network 標籤的請求詳情

## 🔍 診斷步驟

如果上傳仍然失敗：

### 1. 檢查網絡請求

1. 按 `F12` 打開開發者工具
2. 前往「Network」標籤
3. 嘗試上傳
4. 找到 `POST /api/recordings` 請求
5. 檢查：
   - **Status Code**：應該是 201（成功）或 400/500（錯誤）
   - **Request Headers**：
     - `Content-Type` 應該是 `multipart/form-data; boundary=...`
     - `Authorization` 應該包含 Bearer token
   - **Request Payload**：應該包含音頻文件
   - **Response**：查看錯誤訊息

### 2. 檢查後端日誌

如果使用 Render：
1. 前往 Render Dashboard
2. 選擇您的服務
3. 查看「Logs」標籤
4. 查找錯誤訊息

### 3. 常見錯誤

#### 錯誤 1：`未收到音檔`
- **原因**：FormData 沒有正確發送
- **解決**：確認 Content-Type 是 `multipart/form-data`

#### 錯誤 2：`只接受 webm 音檔`
- **原因**：文件格式不正確
- **解決**：確認使用 `audio/webm` MIME type

#### 錯誤 3：`401 Unauthorized`
- **原因**：JWT token 無效或過期
- **解決**：重新登入

#### 錯誤 4：`500 Internal Server Error`
- **原因**：後端錯誤（Firebase 配置、權限等）
- **解決**：檢查 Render 日誌

#### 錯誤 5：`CORS 錯誤`
- **原因**：後端 CORS 配置問題
- **解決**：確認後端允許前端域名

## 🛠️ 如果問題持續

### 檢查 1：確認 API_BASE 配置

在瀏覽器控制台運行：
```javascript
console.log('API_BASE:', import.meta.env.VITE_API_BASE);
```

應該顯示您的 Render 後端 URL。

### 檢查 2：測試後端健康狀態

訪問：
```
https://your-backend-url.onrender.com
```

應該看到服務運行中的提示。

### 檢查 3：測試上傳端點（使用 curl）

```powershell
# 替換為您的實際值
$token = "your-jwt-token"
$backendUrl = "https://your-backend-url.onrender.com"

# 創建測試音頻文件（空文件用於測試）
$testFile = "test.webm"
# 或使用實際錄音文件

Invoke-RestMethod -Uri "$backendUrl/api/recordings" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $token"
  } `
  -InFile $testFile `
  -ContentType "multipart/form-data"
```

## 📋 檢查清單

- [ ] 已清除瀏覽器緩存
- [ ] 已重新部署前端（Vercel 自動部署）
- [ ] 已測試上傳功能
- [ ] 已檢查 Network 請求
- [ ] 已檢查錯誤訊息
- [ ] 已檢查後端日誌（如果使用 Render）

## 💡 提示

1. **文件大小限制**：後端限制為 25MB
2. **文件格式**：只接受 `.webm` 格式
3. **認證**：確保已登入且 token 有效
4. **網絡**：確保前端可以訪問後端 URL

## 🎉 完成後

如果上傳成功：
- ✅ 錄音會出現在錄音列表中
- ✅ 可以播放錄音
- ✅ 學生可以等待老師/家長確認

如果仍有問題，請提供：
- 瀏覽器控制台的錯誤訊息
- Network 標籤的請求詳情
- Render 後端日誌（如果可用）
