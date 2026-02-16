# Vercel 部署指南

## 部署架構

由於這個應用有後端服務器（Express + SQLite），建議採用以下架構：

- **前端**：部署到 Vercel（靜態網站）
- **後端**：部署到 Render（支持持久化存儲和文件上傳）

## 步驟 1：部署後端到 Render

1. 前往 [Render](https://render.com) 註冊帳號
2. 創建新的 **Web Service**
3. 連接你的 GitHub 倉庫
4. 設置：
   - **Name**: `bible-memorize-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free 或 Starter

5. 添加環境變量（如果需要）：
   - `NODE_ENV`: `production`
   - `PORT`: `10000`（Render 自動設置，但可以明確指定）

6. 部署完成後，記下後端 URL，例如：`https://bible-memorize-backend.onrender.com`

## 步驟 2：部署前端到 Vercel

### 方法一：通過 Vercel Dashboard（推薦）

1. 前往 [Vercel](https://vercel.com) 註冊/登入
2. 點擊 **Add New Project**
3. 導入你的 GitHub 倉庫
4. 設置：
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. 添加環境變量：
   - `VITE_API_BASE`: `https://your-backend-url.onrender.com`
   （替換為你的 Render 後端 URL）

6. 點擊 **Deploy**

### 方法二：通過 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 進入 client 目錄
cd client

# 部署
vercel

# 設置環境變量
vercel env add VITE_API_BASE production
# 輸入：https://your-backend-url.onrender.com
```

## 步驟 3：配置 CORS

確保後端允許 Vercel 前端的請求。在 `server/index.js` 中已經配置了 `cors()`，應該可以正常工作。

如果需要限制特定域名，可以修改：

```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

## 步驟 4：更新 Vercel 配置（可選）

如果使用根目錄的 `vercel.json`，需要更新後端 URL：

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.onrender.com/api/$1"
    },
    {
      "src": "/storage/(.*)",
      "dest": "https://your-backend-url.onrender.com/storage/$1"
    }
  ]
}
```

## 環境變量說明

### 前端（Vercel）
- `VITE_API_BASE`: 後端 API 的完整 URL（例如：`https://your-app.onrender.com`）

### 後端（Render）
- `NODE_ENV`: `production`
- `PORT`: Render 會自動設置，無需手動配置
- `ADMIN_PASSWORD`: （可選）自定義管理員密碼

## 數據存儲

### Render 免費計劃注意事項

⚠️ **重要**：Render 免費計劃的磁盤是**臨時的**，應用休眠後數據可能會丟失。

**解決方案**：
1. 升級到 Render Starter 計劃（$7/月）- 提供持久化磁盤
2. 使用外部數據庫（如 PostgreSQL）替代 SQLite
3. 定期備份數據

### 數據備份

可以添加定期備份腳本，將數據庫文件上傳到雲存儲（如 AWS S3、Google Cloud Storage）。

## 手機訪問

部署完成後，手機可以通過以下方式訪問：

1. **直接訪問**：在手機瀏覽器中打開 Vercel 提供的 URL
2. **PWA 安裝**：
   - Android：瀏覽器選單 → 「添加到主屏幕」
   - iPhone：Safari 分享 → 「加入主畫面」

## 常見問題

### 1. API 請求失敗（CORS 錯誤）

確保後端的 CORS 配置允許 Vercel 域名。

### 2. 文件上傳失敗

確保 Render 後端有足夠的磁盤空間，並且路徑配置正確。

### 3. 數據丟失

Render 免費計劃的磁盤是臨時的，考慮升級或使用外部數據庫。

### 4. 環境變量未生效

在 Vercel Dashboard 中設置環境變量後，需要重新部署。

## 更新部署

### 前端更新
```bash
cd client
vercel --prod
```

### 後端更新
在 Render Dashboard 中點擊 **Manual Deploy** 或推送代碼到 GitHub。

## 監控和日誌

- **Vercel**: Dashboard → Project → Analytics/Logs
- **Render**: Dashboard → Service → Logs

## 成本估算

- **Vercel**: 免費計劃足夠（個人項目）
- **Render**: 
  - 免費計劃：可用但數據可能丟失
  - Starter 計劃：$7/月（推薦，提供持久化存儲）
