# 部署指南

## Vercel 部署（前端）

### 快速部署

1. **通過 Vercel Dashboard**：
   - 前往 https://vercel.com
   - 點擊 "Add New Project"
   - 導入 GitHub 倉庫
   - 設置：
     - **Root Directory**: `client`
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - 添加環境變量：
     - `VITE_API_BASE`: `https://your-backend-url.onrender.com`
   - 點擊 Deploy

2. **通過 CLI**：
   ```bash
   cd client
   npm i -g vercel
   vercel
   ```

### 環境變量設置

在 Vercel Dashboard → Project → Settings → Environment Variables 中添加：

```
VITE_API_BASE=https://your-backend-url.onrender.com
```

**重要**：將 `your-backend-url.onrender.com` 替換為你的實際後端 URL。

## Render 部署（後端）

### 步驟

1. 前往 https://render.com
2. 創建新的 **Web Service**
3. 連接 GitHub 倉庫
4. 設置：
   - **Name**: `bible-memorize-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 點擊 **Create Web Service**

### 注意事項

⚠️ **Render 免費計劃限制**：
- 應用休眠後數據可能丟失（磁盤是臨時的）
- 建議升級到 Starter 計劃（$7/月）以獲得持久化存儲

## 部署後配置

### 1. 更新前端環境變量

在 Vercel Dashboard 中設置 `VITE_API_BASE` 為你的 Render 後端 URL。

### 2. 確保 CORS 配置正確

後端已經配置了 `cors()`，應該允許所有來源。如果需要限制，修改 `server/index.js`：

```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app'],
  credentials: true
}));
```

### 3. 測試部署

訪問 Vercel 提供的 URL，測試：
- ✅ 登入功能
- ✅ 錄音上傳
- ✅ 簽到功能
- ✅ 積分顯示

## 手機訪問

部署完成後，手機可以：

1. **直接訪問**：在瀏覽器中打開 Vercel URL
2. **安裝 PWA**：
   - Android: 瀏覽器選單 → "添加到主屏幕"
   - iPhone: Safari 分享 → "加入主畫面"

## 更新應用

### 前端更新
```bash
cd client
vercel --prod
```

或直接推送代碼到 GitHub，Vercel 會自動部署。

### 後端更新
推送代碼到 GitHub，Render 會自動部署。

## 故障排除

### API 請求失敗
- 檢查 `VITE_API_BASE` 環境變量是否正確設置
- 檢查後端是否正在運行
- 檢查 CORS 配置

### 文件上傳失敗
- 確保 Render 後端有足夠的磁盤空間
- 檢查 `server/storage` 目錄權限

### 數據丟失
- Render 免費計劃的磁盤是臨時的
- 考慮升級到 Starter 計劃或使用外部數據庫
