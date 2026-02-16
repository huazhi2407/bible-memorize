# Firebase 設置成功後的下一步

## ✅ 確認成功

如果看到以下輸出，表示 Firebase 設置成功：

```
✅ Firebase Admin SDK 初始化成功
✅ Firestore 連接成功
✅ 方法 3 成功（寫入成功）
```

## 🚀 步驟 1：啟動服務器

### 1.1 啟動 Firebase 後端

```bash
cd server-firebase
npm start
```

應該看到：
```
Firebase Admin SDK 初始化成功
項目 ID: your-project-id
Server running at http://localhost:3001
```

### 1.2 確認服務器運行

打開瀏覽器訪問：http://localhost:3001

應該看到服務器運行中的提示或 API 響應。

## 🧪 步驟 2：測試 API 端點

### 2.1 測試註冊功能

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"test\",\"password\":\"test123\",\"role\":\"student\"}"
```

應該返回用戶信息和 token。

### 2.2 測試登入功能

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"admin\",\"password\":\"admin123\"}"
```

應該返回用戶信息和 token。

## 🌐 步驟 3：連接前端

### 3.1 更新前端環境變量

在 `client/` 目錄中創建或更新 `.env` 文件：

```bash
VITE_API_BASE=http://localhost:3001
```

### 3.2 啟動前端

```bash
# 在項目根目錄
npm run dev:client
```

或：

```bash
cd client
npm run dev
```

前端應該運行在：http://localhost:5173

### 3.3 測試完整流程

1. **訪問前端**：http://localhost:5173
2. **登入**：使用預設管理員
   - 帳號：`admin`
   - 密碼：`admin123`
3. **測試功能**：
   - ✅ 錄音上傳
   - ✅ 查看錄音列表
   - ✅ 簽到功能
   - ✅ 經文計劃（管理員）
   - ✅ 積分系統

## 📋 步驟 4：檢查功能清單

### 4.1 基本功能

- [ ] 用戶註冊
- [ ] 用戶登入
- [ ] 錄音上傳
- [ ] 錄音播放
- [ ] 錄音刪除
- [ ] 簽到功能
- [ ] 查看簽到記錄

### 4.2 管理員功能

- [ ] 查看所有用戶
- [ ] 刪除用戶
- [ ] 查看所有錄音
- [ ] 刪除錄音
- [ ] 創建經文計劃
- [ ] 確認學生合格
- [ ] 調整學生積分

### 4.3 積分系統

- [ ] 學生積分顯示
- [ ] 積分排行榜
- [ ] 簽到加分
- [ ] 未錄音扣分
- [ ] 管理員調整積分

## 🚢 步驟 5：部署準備（可選）

### 5.1 設置生產環境規則

在 Firebase Console → Firestore Database → 規則，設置生產環境規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // 拒絕所有直接訪問
    }
  }
}
```

### 5.2 準備部署配置

1. **環境變量**：
   - `FIREBASE_SERVICE_ACCOUNT`：服務帳戶 JSON（作為字符串）
   - `NODE_ENV`：`production`
   - `PORT`：部署平台分配的端口
   - `JWT_SECRET`：隨機字符串（必須更改）
   - `ADMIN_PASSWORD`：自定義管理員密碼

2. **部署平台**：
   - Render
   - Firebase Functions
   - Google Cloud Run
   - 其他 Node.js 平台

## 📝 步驟 6：記錄重要信息

創建一個 `DEPLOYMENT.md` 文件記錄：

- **項目 ID**：________________
- **Firestore 位置**：________________
- **Storage 位置**：________________
- **服務帳戶電子郵件**：________________
- **部署 URL**：________________

## 🔧 步驟 7：常見問題排查

### 問題：前端無法連接後端

**解決**：
1. 確認 `VITE_API_BASE` 環境變量正確
2. 確認後端正在運行
3. 檢查 CORS 配置

### 問題：錄音上傳失敗

**解決**：
1. 確認 Firebase Storage 已啟用
2. 確認 Storage 安全規則正確
3. 檢查文件大小限制（25MB）

### 問題：Firestore 查詢失敗

**解決**：
1. 確認 Firestore 規則允許訪問
2. 確認服務帳戶權限正確
3. 檢查數據庫位置

## ✅ 完成檢查清單

- [ ] Firebase 後端啟動成功
- [ ] API 端點測試通過
- [ ] 前端連接後端成功
- [ ] 所有功能測試通過
- [ ] 生產環境規則已設置
- [ ] 部署配置已準備（如需要）

## 🎉 恭喜！

您的 Firebase 後端已經成功設置並運行！現在可以：

1. **繼續開發**：添加新功能
2. **測試應用**：確保所有功能正常
3. **準備部署**：部署到生產環境
4. **使用應用**：開始使用您的經文背誦應用

## 📚 相關文檔

- `README.md` - 完整文檔
- `SETUP.md` - 設置指南
- `DEPLOYMENT.md` - 部署指南（如需要）

## 💡 提示

1. **開發階段**：可以使用寬鬆的 Firestore 規則
2. **生產環境**：必須設置嚴格的安全規則
3. **定期備份**：定期備份 Firestore 數據
4. **監控使用量**：關注 Firebase 使用量，避免超出免費額度
