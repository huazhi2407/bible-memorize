# 修復 500 錯誤

## 🔍 問題分析

後端多個 API 端點返回 500 錯誤：
- `/api/checkins` - 500 錯誤
- `/api/scripture-plans/list` - 500 錯誤
- `/api/recordings` - 500 錯誤

## ✅ 已修復

### 1. `getISOWeek` 函數順序問題

**問題**：在 `checkins.js` 和 `scripture-plans.js` 中，`getISOWeek` 函數在文件底部定義，但在使用之前就被調用了，導致 "Cannot access 'getISOWeek' before initialization" 錯誤。

**修復**：
- ✅ 將 `getISOWeek` 函數移到文件頂部（導入之後）
- ✅ 確保函數在使用前已定義

### 2. 改進錯誤日誌

**問題**：錯誤處理不夠詳細，難以診斷問題。

**修復**：
- ✅ 添加詳細的錯誤日誌（包括錯誤訊息和堆棧）
- ✅ 在響應中包含錯誤詳情（用於調試）

## 🧪 測試步驟

1. **等待 Render 重新部署**：
   - 修復已推送到 GitHub
   - Render 會自動重新部署（約 1-2 分鐘）

2. **測試 API 端點**：
   - 刷新前端頁面
   - 檢查是否還有 500 錯誤
   - 查看瀏覽器控制台

3. **檢查 Render 日誌**：
   - 前往 Render Dashboard
   - 選擇您的服務
   - 查看「Logs」標籤
   - 確認沒有錯誤

## 🔍 如果問題持續

### 檢查 1：查看 Render 日誌

1. 前往 Render Dashboard
2. 選擇您的服務
3. 查看「Logs」標籤
4. 查找錯誤訊息

常見錯誤：
- `Cannot access 'getISOWeek' before initialization` - 已修復
- `Firestore connection error` - 檢查 Firebase 配置
- `Permission denied` - 檢查 Firestore 安全規則

### 檢查 2：測試後端健康狀態

訪問：
```
https://your-backend-url.onrender.com
```

應該看到服務運行中的提示。

### 檢查 3：測試 API 端點（使用 curl）

```powershell
# 替換為您的實際值
$token = "your-jwt-token"
$backendUrl = "https://your-backend-url.onrender.com"

# 測試 checkins API
Invoke-RestMethod -Uri "$backendUrl/api/checkins?year=2026&week=8" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

# 測試 recordings API
Invoke-RestMethod -Uri "$backendUrl/api/recordings" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

### 檢查 4：Firebase 配置

確認以下環境變量已設置：
- `FIREBASE_SERVICE_ACCOUNT` - Firebase 服務帳號 JSON（單行格式）
- `JWT_SECRET` - JWT 密鑰
- `PORT` - 端口（Render 自動設置）

## 📋 檢查清單

- [ ] 修復已推送到 GitHub
- [ ] Render 重新部署完成
- [ ] 前端刷新後測試
- [ ] 檢查瀏覽器控制台
- [ ] 檢查 Render 日誌
- [ ] 確認沒有 500 錯誤

## 💡 常見問題

### 問題 1：Firestore 連接錯誤

**症狀**：日誌顯示 `5 NOT_FOUND` 或 `7 PERMISSION_DENIED`

**解決**：
1. 確認 Firestore 已啟用
2. 確認服務帳號有正確權限
3. 檢查 Firestore 安全規則（開發時可以使用 `if true;`）

### 問題 2：函數未定義錯誤

**症狀**：`ReferenceError: getISOWeek is not defined`

**解決**：已修復，確保函數在使用前定義

### 問題 3：權限錯誤

**症狀**：`403 Forbidden` 或 `401 Unauthorized`

**解決**：
1. 確認 JWT token 有效
2. 確認用戶角色正確
3. 檢查 `adminOnly` 中間件（某些端點需要管理員權限）

## 🎉 完成後

如果所有錯誤都解決了：
- ✅ API 端點正常響應
- ✅ 前端可以正常加載數據
- ✅ 沒有控制台錯誤
- ✅ Render 日誌沒有錯誤

## 🆘 如果問題持續

如果修復後仍有問題，請提供：
1. **Render 日誌**：最新的錯誤訊息
2. **瀏覽器控制台**：錯誤詳情
3. **Network 標籤**：請求詳情（Status Code、Response）

這樣我可以進一步診斷問題。
