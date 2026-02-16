# 修復登入錯誤

## ❌ 錯誤：Unexpected end of JSON input

這個錯誤表示後端返回了空響應或非 JSON 格式的響應。

## 🔍 問題原因

1. **API 路徑問題**：Login.jsx 使用了相對路徑 `/api/auth/login`，沒有使用 `API_BASE`
2. **後端未運行**：Render 後端可能還沒啟動或休眠中
3. **CORS 問題**：跨域請求被阻止
4. **響應格式問題**：後端返回了非 JSON 響應

## ✅ 已修復

已更新 `Login.jsx` 和 `Register.jsx`：
- ✅ 使用 `API_BASE + '/api/auth/login'`
- ✅ 添加了更好的錯誤處理
- ✅ 檢查響應是否為空
- ✅ 更清晰的錯誤訊息

## 🧪 測試步驟

### 步驟 1：確認後端運行

1. **訪問 Render 後端 URL**：
   ```
   https://bible-memorize-m9q4.onrender.com
   ```

2. **應該看到**：服務運行中的提示或 API 響應

3. **如果無法訪問**：
   - Render 免費方案在 15 分鐘無活動後會休眠
   - 首次請求會較慢（冷啟動）
   - 等待幾秒鐘後重試

### 步驟 2：測試 API

在 PowerShell 運行：

```powershell
$url = "https://bible-memorize-m9q4.onrender.com/api/auth/login"
$body = '{"name":"admin","password":"admin123"}'

Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json" -Body $body
```

應該返回用戶信息和 token。

### 步驟 3：重新部署前端

修復後需要重新部署前端：

1. **提交更改**：
   ```bash
   cd c:\Users\jerey\bible-memorize
   git add client/src/pages/Login.jsx client/src/pages/Register.jsx
   git commit -m "Fix login API path and error handling"
   git push origin main
   ```

2. **Vercel 會自動重新部署**（如果已連接 GitHub）

3. **或手動重新部署**：
   - Vercel Dashboard → Deployments → Redeploy

### 步驟 4：測試登入

1. **訪問前端 URL**
2. **嘗試登入**：
   - 帳號：`admin`
   - 密碼：`admin123`

3. **如果仍然失敗**：
   - 檢查瀏覽器控制台（F12）查看詳細錯誤
   - 檢查網絡請求是否成功
   - 確認 `VITE_API_BASE` 環境變量正確

## 🔍 調試步驟

### 檢查環境變量

在瀏覽器控制台運行：

```javascript
console.log('API_BASE:', import.meta.env.VITE_API_BASE);
```

應該顯示：`https://bible-memorize-m9q4.onrender.com`

### 檢查網絡請求

1. 打開瀏覽器開發者工具（F12）
2. 前往「Network」標籤
3. 嘗試登入
4. 查看 `/api/auth/login` 請求：
   - **Status**：應該是 200
   - **Response**：應該包含 JSON 數據

### 常見問題

#### 問題 1：CORS 錯誤

**錯誤訊息**：`CORS policy: No 'Access-Control-Allow-Origin' header`

**解決**：確認後端 CORS 配置正確（應該已經配置）

#### 問題 2：404 Not Found

**錯誤訊息**：`404 Not Found`

**解決**：
- 確認後端 URL 正確
- 確認後端正在運行
- 確認 API 路徑正確

#### 問題 3：空響應

**錯誤訊息**：`Unexpected end of JSON input`

**解決**：
- 確認後端正在運行
- 等待 Render 冷啟動完成
- 檢查後端日誌

## 📝 下一步

1. **提交修復**：推送代碼到 GitHub
2. **等待 Vercel 重新部署**：通常自動觸發
3. **測試登入**：確認錯誤已修復
4. **如果仍有問題**：檢查瀏覽器控制台和網絡請求

## 💡 提示

1. **Render 免費方案**：首次請求會較慢（冷啟動）
2. **環境變量**：確認 Vercel 中的 `VITE_API_BASE` 正確
3. **瀏覽器緩存**：如果問題持續，嘗試清除緩存或使用無痕模式
