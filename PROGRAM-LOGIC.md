# 經文背誦應用程式邏輯說明

## 📋 目錄
1. [整體架構](#整體架構)
2. [用戶角色與權限](#用戶角色與權限)
3. [認證流程](#認證流程)
4. [核心功能邏輯](#核心功能邏輯)
5. [數據流程](#數據流程)
6. [積分系統](#積分系統)

---

## 🏗️ 整體架構

### 前端（React + Vite）
- **位置**：`client/`
- **技術棧**：React 18, React Router, Context API
- **部署**：Vercel

### 後端（Node.js + Express）
- **位置**：`server-firebase/`
- **技術棧**：Express, Firebase Firestore, Firebase Storage
- **部署**：Render

### 數據庫
- **Firestore**：用戶、錄音記錄、簽到、經文計劃、確認記錄、積分歷史
- **Firebase Storage**：音頻文件（webm 格式）

---

## 👥 用戶角色與權限

### 1. **Admin（管理員）**
- ✅ 完整權限：可以編輯所有內容
- ✅ 管理用戶：創建、刪除用戶
- ✅ 管理錄音：查看、刪除所有錄音
- ✅ 管理經文：上傳每週經文計劃
- ✅ 調整積分：可以調整任何學生的積分

### 2. **Teacher/Parent（老師/家長）**
- ✅ 查看權限：可以查看所有學生的錄音和簽到
- ✅ 確認權限：可以確認學生錄音是否合格
- ✅ 調整積分：可以調整學生的積分
- ❌ 刪除權限：不能刪除用戶或錄音

### 3. **Student（學生）**
- ✅ 查看自己的錄音和簽到
- ✅ 錄音功能：可以錄製並上傳音頻
- ✅ 查看積分：可以查看自己的積分和排行榜
- ❌ 確認權限：不能確認自己或其他人的錄音
- ❌ 調整積分：不能調整積分

---

## 🔐 認證流程

### 註冊流程
```
用戶輸入名字 + 密碼
  ↓
後端生成唯一編號（時間戳 + 隨機數）
  ↓
密碼使用 bcrypt 加密
  ↓
存儲到 Firestore (users 集合)
  ↓
返回用戶信息（不含密碼）
```

### 登入流程
```
用戶輸入名字/編號 + 密碼
  ↓
後端查找用戶（按名字或編號）
  ↓
驗證密碼（bcrypt.compare）
  ↓
生成 JWT Token（包含 userId）
  ↓
返回用戶信息和 Token
  ↓
前端存儲到 localStorage
```

### 認證中間件
- 每個 API 請求都需要 `Authorization: Bearer <token>` header
- 後端驗證 JWT Token
- 如果 Token 無效或過期，返回 401，前端自動跳轉到登入頁

---

## 🎯 核心功能邏輯

### 1. 錄音功能

#### 前端流程（Home.jsx）
```
用戶點擊「開始錄音」
  ↓
使用 MediaRecorder API 錄製音頻（webm 格式）
  ↓
錄音數據存儲在 chunksRef 中
  ↓
用戶點擊「停止並儲存」
  ↓
將 chunks 合併為 Blob
  ↓
創建 FormData，上傳到 /api/recordings
  ↓
顯示上傳狀態
```

#### 後端流程（routes/recordings.js）
```
接收 FormData（multer 處理）
  ↓
驗證文件格式（只接受 webm）
  ↓
生成唯一文件名（UUID.webm）
  ↓
上傳到 Firebase Storage（recordings/ 目錄）
  ↓
在 Firestore 創建錄音記錄（recordings 集合）
  ↓
返回錄音信息（包含 audioUrl）
```

#### 文件訪問
```
前端請求 /storage/:filename?token=xxx
  ↓
後端驗證 JWT Token
  ↓
檢查權限（學生只能訪問自己的錄音）
  ↓
從 Firebase Storage 獲取簽名 URL（1小時有效）
  ↓
重定向到簽名 URL
```

### 2. 簽到功能

#### 學生簽到流程
```
學生錄音完成
  ↓
老師/家長確認合格（approvals 集合）
  ↓
系統自動簽到（checkins 集合）
  ↓
自動加分（+1 分，原因：完成簽到）
```

#### 老師/家長簽到流程
```
老師/家長有錄音
  ↓
可以直接簽到（不需要確認）
  ↓
不會自動加分
```

#### 簽到邏輯（routes/checkins.js）
- 學生簽到：需要先有確認記錄（approval）
- 老師/家長簽到：可以直接簽到
- 防止重複簽到：檢查當天是否已簽到

### 3. 確認功能（Approvals）

#### 確認流程（routes/approvals.js）
```
老師/家長點擊「確認合格」
  ↓
創建確認記錄（approvals 集合）
  ↓
自動為學生簽到（addCheckin）
  ↓
自動加分（+1 分，如果還沒加過）
```

#### 確認狀態檢查
- 前端每 3 秒輪詢確認狀態
- 如果已確認，顯示「已確認合格並自動簽到」

### 4. 經文計劃功能

#### 上傳經文（Admin.jsx）
```
管理員選擇年份和週數
  ↓
輸入 7 段經文（對應週一到週日）
  ↓
提交到 /api/scripture-plans
  ↓
存儲到 Firestore（scripture_plans 集合）
```

#### 顯示經文（Home.jsx）
```
根據當前日期計算 ISO 週數
  ↓
查詢當週的經文計劃
  ↓
根據今天是週幾，顯示累積的經文
  ↓
例如：第 3 天顯示第 1、2、3 段經文
```

---

## 📊 數據流程

### 數據集合結構

#### 1. users（用戶）
```javascript
{
  id: "doc-id",
  number: "1234567890",      // 唯一編號
  name: "張三",
  password_hash: "bcrypt...", // 加密密碼
  role: "student",           // admin, teacher, parent, student
  points: 0,                 // 積分（僅學生）
  created_at: Timestamp
}
```

#### 2. recordings（錄音）
```javascript
{
  id: "doc-id",
  user_id: "user-id",
  filename: "uuid.webm",     // Firebase Storage 文件名
  created_at: Timestamp
}
```

#### 3. checkins（簽到）
```javascript
{
  id: "doc-id",
  user_id: "user-id",
  date: "2026-02-16",        // ISO 日期字符串
  created_at: Timestamp
}
```

#### 4. scripture_plans（經文計劃）
```javascript
{
  id: "doc-id",
  year: 2026,
  week: 8,
  day1_text: "第一段經文",
  day2_text: "第二段經文",
  // ... day7_text
  created_at: Timestamp
}
```

#### 5. approvals（確認記錄）
```javascript
{
  id: "doc-id",
  student_id: "user-id",
  approver_id: "user-id",    // 確認者的 ID
  date: "2026-02-16",
  created_at: Timestamp
}
```

#### 6. points_history（積分歷史）
```javascript
{
  id: "doc-id",
  student_id: "user-id",
  points_change: 1,          // 積分變化（+1 或 -1）
  reason: "完成簽到",        // 原因
  adjusted_by: "user-id",    // 調整者（null 表示自動）
  date: "2026-02-16",
  created_at: Timestamp
}
```

---

## 🎮 積分系統

### 積分規則

#### 加分情況
1. **完成簽到**：+1 分
   - 觸發時機：學生被確認合格並自動簽到時
   - 防止重複：每天只能加一次

2. **手動調整**：老師/家長/管理員可以手動調整
   - 可以加任意分數
   - 記錄調整原因和調整者

#### 扣分情況
1. **未錄音扣分**：-1 分
   - 觸發時機：學生訪問頁面時，系統檢查當天是否有錄音
   - 防止重複：每天只能扣一次
   - 條件：當天沒有錄音記錄

### 積分計算邏輯

#### 獲取學生積分（db-firebase.js）
```javascript
// 從 users 集合讀取 points 字段
// 這個字段在每次調整積分時更新
```

#### 調整積分（db-firebase.js）
```javascript
1. 更新 users 集合的 points 字段
2. 創建 points_history 記錄
3. 返回新的積分
```

### 積分排行榜

- **所有人可見**：學生、老師、家長、管理員都可以看到
- **排序方式**：按積分從高到低排序
- **顯示內容**：
  - 排名（前 3 名有獎牌圖標）
  - 姓名
  - 積分
  - 當前用戶標記（「我」）

---

## 🔄 完整流程示例

### 學生完成一天的背誦

```
1. 學生登入
   ↓
2. 查看當週經文（累積顯示）
   ↓
3. 點擊「開始錄音」
   ↓
4. 錄製音頻
   ↓
5. 點擊「停止並儲存」
   ↓
6. 上傳到 Firebase Storage
   ↓
7. 創建錄音記錄
   ↓
8. 老師/家長查看錄音
   ↓
9. 點擊「確認合格」
   ↓
10. 創建確認記錄
    ↓
11. 自動簽到
    ↓
12. 自動加分（+1 分）
    ↓
13. 學生看到「已確認合格並自動簽到」
```

### 如果學生沒有錄音

```
1. 學生訪問頁面
   ↓
2. 系統檢查當天是否有錄音
   ↓
3. 如果沒有錄音
   ↓
4. 檢查今天是否已經扣過分
   ↓
5. 如果還沒扣過，自動扣分（-1 分）
   ↓
6. 創建積分歷史記錄（原因：未錄音扣分）
```

---

## 🔒 權限控制

### 錄音訪問權限
- **學生**：只能訪問自己的錄音
- **老師/家長/管理員**：可以訪問所有錄音

### 文件下載權限（/storage/:filename）
```javascript
if (user.role === 'student') {
  // 檢查錄音是否屬於該學生
  if (recording.user_id !== user.id) {
    return 403; // 無權限
  }
}
// 管理員/老師/家長可以訪問所有文件
```

### API 權限
- 所有 API 都需要 JWT 認證
- 某些 API 需要特定角色（如 `adminOnly` 中間件）

---

## 📱 前端頁面結構

### 1. Login（登入頁）
- 輸入名字/編號 + 密碼
- 登入後跳轉到 Home

### 2. Register（註冊頁）
- 輸入名字 + 密碼
- 註冊後自動登入

### 3. Home（首頁）
- **學生視圖**：
  - 顯示當週經文（累積）
  - 錄音功能
  - 積分顯示
  - 積分排行榜
  - 週曆簽到（只讀）
- **老師/家長視圖**：
  - 顯示當週經文
  - 錄音列表
  - 積分排行榜
  - 週曆簽到（可操作）

### 4. Admin（管理頁）
- **用戶管理**：查看、刪除用戶
- **錄音管理**：查看、刪除錄音
- **經文管理**：上傳每週經文計劃
- **學生管理**：確認學生合格、調整積分

---

## 🛠️ 技術細節

### 日期處理
- 使用 ISO 週數（ISO 8601）
- 簽到日期使用 ISO 日期字符串（YYYY-MM-DD）
- 週曆顯示使用 ISO 週的 7 天

### 文件上傳
- 使用 `multer` 處理文件上傳
- 內存存儲（不保存到磁盤）
- 直接上傳到 Firebase Storage
- 文件大小限制：25MB

### 錯誤處理
- 前端：顯示用戶友好的錯誤訊息
- 後端：記錄詳細錯誤日誌
- 401 錯誤：自動登出並跳轉到登入頁

### 緩存策略
- Service Worker：只緩存 HTML 頁面，不緩存資源文件
- 資源文件：由瀏覽器和 CDN 緩存（長期緩存）

---

## 📝 總結

這是一個完整的經文背誦管理系統，包含：
- ✅ 用戶認證和角色管理
- ✅ 音頻錄製和存儲
- ✅ 週曆簽到系統
- ✅ 積分系統和排行榜
- ✅ 經文計劃管理
- ✅ 確認和審核流程

所有功能都圍繞「學生背誦經文 → 錄音 → 確認 → 簽到 → 積分」這個核心流程設計。
