# 部署到 HuggingFace Spaces

本指南說明如何將經文背誦 API 後端部署到 HuggingFace Spaces。

## 📋 前置需求

1. **HuggingFace 帳號**
   - 前往 [HuggingFace](https://huggingface.co/) 註冊帳號
   - 確認帳號已驗證

2. **Firebase 項目設置**
   - Firebase 項目已創建
   - Firestore Database 已啟用
   - Firebase Storage 已啟用
   - 服務帳號 JSON 文件已準備

## 🚀 部署步驟

### 步驟 1：創建 HuggingFace Space

1. 前往 [HuggingFace Spaces](https://huggingface.co/spaces)
2. 點擊 **"New Space"**
3. 填寫以下信息：
   - **Space name**: `bible-memorize-api`（或您喜歡的名稱）
   - **SDK**: 選擇 **Docker**
   - **Hardware**: 選擇 **CPU basic**（免費）或更高配置
   - **Visibility**: 選擇 Public 或 Private
4. 點擊 **"Create Space"**

### 步驟 2：上傳代碼

有兩種方式上傳代碼：

#### 方式 A：通過 Git（推薦）

**選項 1：從根目錄推送（如果 HuggingFace Space 支持設置 Root Directory）**

1. 在 HuggingFace Space 頁面，點擊 **Settings** → 設置 **Root Directory** 為 `server-firebase`
2. 在本地執行：
   ```bash
   cd bible-memorize  # 根目錄
   git remote add huggingface https://huggingface.co/spaces/<username>/<space-name>
   git push huggingface main
   ```

**選項 2：只推送 server-firebase 目錄的內容**

如果 HuggingFace Space 不支持設置 Root Directory，可以使用以下方法：

```bash
# 方法 A：使用 git subtree（推薦）
cd bible-memorize  # 根目錄
git subtree push --prefix=server-firebase huggingface main

# 方法 B：創建臨時分支只包含 server-firebase 目錄
cd bible-memorize
git remote add huggingface https://huggingface.co/spaces/<username>/<space-name>
git subtree split --prefix=server-firebase -b deploy-hf
git push huggingface deploy-hf:main
```


**選項 3：在 server-firebase 目錄初始化新的 git 倉庫**

```bash
cd server-firebase
git init
git add .
git commit -m "Initial commit for HuggingFace deployment"
git remote add huggingface https://huggingface.co/spaces/<username>/<space-name>
```

**重要：認證設置**

HuggingFace 不再支持密碼認證，需要使用 token：

1. **獲取 HuggingFace Token**：
   - 前往 https://huggingface.co/settings/tokens
   - 創建一個新的 token（選擇 **Write** 權限）
   - 複製 token（只會顯示一次，請妥善保存）

2. **使用 token 推送**（兩種方式）：

   **方式 A：在 URL 中包含 token**（一次性使用）
   ```bash
   git push -u https://<username>:<YOUR_TOKEN>@huggingface.co/spaces/<username>/<space-name> master
   ```

   **方式 B：使用 Git Credential Manager**（推薦，長期使用）
   ```bash
   # Windows (PowerShell)
   git credential-manager configure
   git push -u huggingface master
   # 當提示時，輸入您的 HuggingFace 用戶名和 token
   
   # 或者使用環境變數
   $env:GIT_TERMINAL_PROMPT=1
   git push -u huggingface master
   ```

   **方式 C：使用 SSH**（最安全）
   - 在 HuggingFace Settings → SSH Keys 添加您的 SSH 公鑰
   - 使用 SSH URL：`git@hf.co:spaces/<username>/<space-name>`

#### 方式 B：直接上傳文件

1. 在 HuggingFace Space 頁面，點擊 **"Files and versions"** 標籤
2. 點擊 **"Add file"** → **"Upload files"**
3. 上傳以下文件：
   - `Dockerfile`
   - `package.json`
   - `index.js`
   - `firebase-config.js`
   - `db-firebase.js`
   - 所有 `routes/` 目錄下的文件
   - 所有 `middleware/` 目錄下的文件
   - `.dockerignore`

### 步驟 3：設置環境變量

1. 在 Space 頁面，點擊 **Settings** 標籤
2. 滾動到 **Variables and secrets** 部分
3. 添加以下環境變量：

#### 必需變量

- **`FIREBASE_SERVICE_ACCOUNT`** ⚠️ **必須設置，否則應用無法啟動**
  
  **獲取 Firebase 服務帳號 JSON：**
  1. 前往 [Firebase Console](https://console.firebase.google.com/)
  2. 選擇您的項目
  3. 點擊右上角 ⚙️ **項目設置**
  4. 選擇 **服務帳戶** 標籤
  5. 點擊 **生成新的私密金鑰**
  6. 確認下載 JSON 文件
  
  **在 HuggingFace Spaces 中設置：**
  1. 打開下載的 JSON 文件
  2. 複製整個 JSON 內容（從 `{` 到 `}`）
  3. 在 HuggingFace Spaces Settings → Variables and secrets
  4. 添加新變量：
     - **Key**: `FIREBASE_SERVICE_ACCOUNT`
     - **Value**: 貼上整個 JSON 內容（作為一行字符串）
  5. 點擊 **Save**
  
  **重要提示：**
  - JSON 必須是有效的 JSON 格式
  - 整個 JSON 作為一個字符串值（不需要額外的引號）
  - 如果 JSON 中有換行，需要移除或轉換為 `\n`

- **`PORT`**（可選，Dockerfile 已設置）
  - 值：`7860`（HuggingFace Spaces 默認端口）
  - 如果不設置，會使用 Dockerfile 中的默認值 7860

#### 可選變量

- **`NODE_ENV`**
  - 值：`production`

- **`ADMIN_PASSWORD`**
  - 值：自定義的管理員密碼（默認為 `admin123`）

- **`JWT_SECRET`**
  - 值：隨機字符串（生產環境必須更改）
  - 建議使用強隨機字符串生成器

- **`FIREBASE_STORAGE_BUCKET`**
  - 值：Firebase Storage bucket 名稱（可選，會自動檢測）

### 步驟 4：構建和部署

1. HuggingFace Spaces 會自動檢測到 `Dockerfile` 並開始構建
2. 前往 **Logs** 標籤查看構建進度
3. 等待構建完成（通常需要 5-10 分鐘）
4. 構建完成後，Space 會自動啟動

### 步驟 5：驗證部署

1. 構建完成後，訪問 Space URL（格式：`https://<username>-<space-name>.hf.space`）
2. 應該看到 API 服務正在運行
3. 測試 API 端點：
   ```bash
   curl https://<username>-<space-name>.hf.space/api/auth/login
   ```

## 🔧 配置說明

### Dockerfile

`Dockerfile` 使用 Node.js 18，並設置：
- 工作目錄為 `/app`
- 安裝依賴
- 暴露端口 7860
- 啟動 Node.js 應用

### CORS 配置

應用已配置為允許：
- HuggingFace Spaces 域名（`*.hf.space` 和 `huggingface.co/spaces/*`）
- Vercel 前端域名
- 本地開發環境

### 端口配置

HuggingFace Spaces 使用端口 7860，應用會自動使用環境變量 `PORT` 或默認 7860。

## 📝 更新部署

### 通過 Git 更新

```bash
cd server-firebase
git add .
git commit -m "更新代碼"
git push huggingface main
```

HuggingFace Spaces 會自動檢測變更並重新構建。

### 通過網頁上傳更新

1. 在 Space 頁面，點擊 **Files and versions**
2. 上傳更新的文件
3. Space 會自動重新構建

## ⚠️ 注意事項

1. **免費方案限制**
   - HuggingFace Spaces 免費方案有 CPU 和內存限制
   - 長時間無活動後 Space 會休眠
   - 首次請求可能需要較長時間啟動（冷啟動）

2. **文件存儲**
   - HuggingFace Spaces 的本地存儲是臨時的
   - 建議使用 Firebase Storage 存儲文件，而不是本地文件系統

3. **環境變量大小**
   - `FIREBASE_SERVICE_ACCOUNT` 環境變量可能很大
   - 確保正確格式化為單行 JSON 字符串

4. **日誌查看**
   - 在 Space 頁面的 **Logs** 標籤查看應用日誌
   - 如果遇到問題，檢查日誌中的錯誤訊息

## 🐛 常見問題

### 構建失敗

- 檢查 `Dockerfile` 語法是否正確
- 確認所有依賴文件都已上傳
- 查看構建日誌中的錯誤訊息

### 應用無法啟動

- 檢查環境變量是否正確設置
- 確認 `FIREBASE_SERVICE_ACCOUNT` 格式正確
- 查看應用日誌中的錯誤訊息

### CORS 錯誤

- 確認前端 URL 已添加到 CORS 允許列表
- 檢查 CORS 配置是否正確

### Firebase 連接失敗

- 確認 Firebase 服務帳號 JSON 正確
- 檢查 Firestore 和 Storage 是否已啟用
- 確認項目 ID 和權限正確

## 📚 相關資源

- [HuggingFace Spaces 文檔](https://huggingface.co/docs/hub/spaces)
- [Docker 文檔](https://docs.docker.com/)
- [Firebase 文檔](https://firebase.google.com/docs)

## 🔄 從 Render 遷移

如果您之前使用 Render，遷移到 HuggingFace Spaces 的主要差異：

1. **端口**：從 3001 改為 7860
2. **部署方式**：從 `render.yaml` 改為 `Dockerfile`
3. **環境變量**：設置方式不同（在 Space Settings 中）
4. **域名**：從 `*.onrender.com` 改為 `*.hf.space`

記得更新前端的 `VITE_API_BASE` 環境變量為新的 HuggingFace Space URL！
