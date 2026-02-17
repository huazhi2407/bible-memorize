# 測試 Render 後端 API
# 使用前請替換 $baseUrl 為您的實際 Render URL

$baseUrl = "https://your-service-url.onrender.com"

Write-Host "🧪 測試 Render 後端 API`n" -ForegroundColor Cyan

# 測試 1: 健康檢查
Write-Host "1. 測試健康檢查..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing
    Write-Host "   ✅ 服務運行正常：HTTP $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 服務無法訪問：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 提示：Render 免費方案在 15 分鐘無活動後會休眠，首次請求可能較慢" -ForegroundColor Yellow
}

Write-Host ""

# 測試 2: 登入 API
Write-Host "2. 測試登入 API..." -ForegroundColor Yellow
try {
    $body = @{
        name = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "   ✅ 登入成功！" -ForegroundColor Green
    Write-Host "   用戶：$($response.user.name)" -ForegroundColor White
    Write-Host "   角色：$($response.user.role)" -ForegroundColor White
    Write-Host "   Token：$($response.token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ 登入失敗：$($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   響應：$responseBody" -ForegroundColor Red
    }
}

Write-Host "`n✅ 測試完成！" -ForegroundColor Cyan
