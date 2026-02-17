# 如何測試 API

## 🧪 方法 1：使用 PowerShell（Windows 終端）

### 步驟 1：打開 PowerShell

1. 按 `Win + X`，選擇「Windows PowerShell」或「終端」
2. 或按 `Win + R`，輸入 `powershell`，按 Enter

### 步驟 2：運行測試命令

**替換 `your-service-url.onrender.com` 為您的實際 Render URL**，然後運行：

```powershell
# 測試登入 API
curl.exe -X POST https://your-service-url.onrender.com/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"admin\",\"password\":\"admin123\"}'
```

**注意**：
- 使用反引號 `` ` `` 來換行（PowerShell）
- 使用單引號 `'` 包裹 JSON
- 或使用 `Invoke-WebRequest`（見下方）

### 使用 Invoke-WebRequest（PowerShell 推薦）

```powershell
# 測試登入 API
$body = @{
    name = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://your-service-url.onrender.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## 🌐 方法 2：使用瀏覽器（簡單方法）

### 測試健康檢查

直接在瀏覽器訪問：
```
https://your-service-url.onrender.com
```

應該看到服務運行中的提示或 API 響應。

### 測試 API（使用瀏覽器擴展）

1. **安裝 Postman**：https://www.postman.com/downloads/
2. **或使用瀏覽器擴展**：
   - REST Client（VS Code 擴展）
   - Thunder Client（VS Code 擴展）

## 🔧 方法 3：使用 VS Code REST Client 擴展

### 步驟 1：安裝擴展

1. 打開 VS Code
2. 擴展市場搜索「REST Client」
3. 安裝「REST Client」擴展

### 步驟 2：創建測試文件

創建 `test-api.http` 文件：

```http
### 測試登入 API
POST https://your-service-url.onrender.com/api/auth/login
Content-Type: application/json

{
  "name": "admin",
  "password": "admin123"
}

### 測試健康檢查
GET https://your-service-url.onrender.com
```

### 步驟 3：運行測試

1. 點擊請求上方的「Send Request」
2. 查看響應結果

## 📱 方法 4：使用在線工具

### 使用 HTTPie Online

1. 前往：https://httpie.io/app
2. 選擇「POST」
3. URL：`https://your-service-url.onrender.com/api/auth/login`
4. Headers：`Content-Type: application/json`
5. Body：
   ```json
   {
     "name": "admin",
     "password": "admin123"
   }
   ```
6. 點擊「Send」

## 🎯 推薦方法

### 最簡單：瀏覽器

直接訪問：
```
https://your-service-url.onrender.com
```

### 最完整：PowerShell

```powershell
# 替換為您的實際 URL
$url = "https://your-service-url.onrender.com/api/auth/login"
$body = '{"name":"admin","password":"admin123"}'

Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json" -Body $body
```

## 📋 測試步驟

### 1. 測試健康檢查

```powershell
# 直接訪問 URL（在瀏覽器）
https://your-service-url.onrender.com
```

### 2. 測試登入 API

```powershell
# PowerShell
Invoke-RestMethod -Uri "https://your-service-url.onrender.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"admin","password":"admin123"}'
```

### 3. 檢查響應

應該返回類似：
```json
{
  "user": {
    "id": "...",
    "name": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## ⚠️ 常見問題

### 問題：curl 命令不存在

**解決**：使用 `Invoke-WebRequest` 或 `Invoke-RestMethod`（PowerShell 內建）

### 問題：連接超時

**解決**：
- Render 免費方案在 15 分鐘無活動後會休眠
- 首次請求會較慢（冷啟動）
- 等待幾秒鐘後重試

### 問題：401 Unauthorized

**解決**：
- 確認用戶名和密碼正確
- 確認預設管理員已創建

## 💡 快速測試腳本

創建 `test-api.ps1` 文件：

```powershell
# 替換為您的實際 URL
$baseUrl = "https://your-service-url.onrender.com"

Write-Host "測試健康檢查..."
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET
    Write-Host "✅ 服務運行正常：$($response.StatusCode)"
} catch {
    Write-Host "❌ 服務無法訪問：$($_.Exception.Message)"
}

Write-Host "`n測試登入 API..."
try {
    $body = @{
        name = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ 登入成功！"
    Write-Host "用戶：$($response.user.name)"
    Write-Host "角色：$($response.user.role)"
    Write-Host "Token：$($response.token.Substring(0, 20))..."
} catch {
    Write-Host "❌ 登入失敗：$($_.Exception.Message)"
    Write-Host $_.Exception.Response
}
```

運行：
```powershell
.\test-api.ps1
```
