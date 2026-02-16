# 推送項目到 GitHub

## 📋 步驟 1：檢查 Git 狀態

首先確認項目是否已經初始化為 Git 倉庫：

```bash
cd c:\Users\jerey\bible-memorize
git status
```

如果顯示 "not a git repository"，需要先初始化：

```bash
git init
```

## 📋 步驟 2：確認 .gitignore 文件

確保 `.gitignore` 文件包含以下內容（已檢查，應該已正確設置）：

```
node_modules/
.env
.env.local
server/google-credentials.json
server/bible-memorizie-*.json
server/storage/
server/temp/
server/data/
client/dist/
dist-electron/
*.log
.DS_Store
server-firebase/.env
server-firebase/firebase-service-account.json
```

**重要**：確保 `firebase-service-account.json` 不會被提交到 Git！

## 📋 步驟 3：添加文件到 Git

### 3.1 檢查要提交的文件

```bash
git status
```

確認以下文件**不會**出現在待提交列表中：
- `server-firebase/firebase-service-account.json` ❌
- `server-firebase/.env` ❌
- `server/.env` ❌
- `node_modules/` ❌

### 3.2 添加文件

```bash
# 添加所有文件（.gitignore 會自動排除敏感文件）
git add .

# 或分別添加
git add .
git add server-firebase/
git add client/
git add server/
git add package.json
git add README.md
```

### 3.3 確認添加的文件

```bash
git status
```

應該看到：
- ✅ 代碼文件
- ✅ 配置文件（package.json 等）
- ❌ 不應該看到敏感文件（firebase-service-account.json, .env）

## 📋 步驟 4：提交更改

```bash
git commit -m "Initial commit: Bible memorize app with Firebase backend"
```

或更詳細的提交信息：

```bash
git commit -m "Initial commit

- Add Firebase backend (server-firebase)
- Add React frontend (client)
- Add original SQLite backend (server)
- Add Electron desktop app support
- Add PWA mobile support
- Configure Firebase Firestore and Storage"
```

## 📋 步驟 5：在 GitHub 創建倉庫

### 5.1 創建新倉庫

1. 前往 https://github.com/new
2. **Repository name**: `bible-memorize`
3. **Description**: `經文背誦應用 - 錄音、簽到、積分系統`
4. **Visibility**: 
   - Public（公開）
   - Private（私有，推薦）
5. **不要**勾選：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. 點擊「**Create repository**」

### 5.2 記下倉庫 URL

創建後，GitHub 會顯示倉庫 URL，例如：
- `https://github.com/your-username/bible-memorize.git`

## 📋 步驟 6：推送到 GitHub

### 6.1 添加遠程倉庫

```bash
# 替換 your-username 為您的 GitHub 用戶名
git remote add origin https://github.com/your-username/bible-memorize.git

# 或使用 SSH（如果您已設置 SSH 密鑰）
git remote add origin git@github.com:your-username/bible-memorize.git
```

### 6.2 推送到 GitHub

```bash
# 推送到 main 分支
git branch -M main
git push -u origin main

# 或推送到 master 分支（如果您的默認分支是 master）
git branch -M master
git push -u origin master
```

### 6.3 輸入認證信息

如果提示輸入用戶名和密碼：
- **用戶名**：您的 GitHub 用戶名
- **密碼**：使用 Personal Access Token（不是 GitHub 密碼）

**如何創建 Personal Access Token**：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 選擇權限：`repo`（完整倉庫權限）
4. 生成並複製 token
5. 使用 token 作為密碼

## 📋 步驟 7：驗證推送

1. 前往您的 GitHub 倉庫頁面
2. 確認所有文件都已上傳
3. **重要**：確認 `firebase-service-account.json` **沒有**出現在文件列表中

## ⚠️ 安全檢查

### 檢查敏感文件是否被提交

```bash
# 檢查是否有敏感文件被提交
git ls-files | grep -E "(firebase-service-account|\.env$)"
```

**如果看到敏感文件**：
1. 從 Git 中移除（但保留本地文件）：
   ```bash
   git rm --cached server-firebase/firebase-service-account.json
   git rm --cached server-firebase/.env
   ```
2. 確認 `.gitignore` 包含這些文件
3. 重新提交：
   ```bash
   git commit -m "Remove sensitive files from git"
   git push
   ```

### 如果敏感文件已被推送到 GitHub

1. **立即刪除 GitHub 上的文件**
2. **重新生成服務帳戶**：
   - 前往 Firebase Console
   - 生成新的服務帳戶 JSON
   - 替換本地文件
3. **更新 .gitignore** 確保不再提交

## 📋 步驟 8：在 Render 中選擇倉庫

推送完成後：

1. 返回 Render Dashboard
2. 在 "New Web Service" → "Source Code"
3. 選擇 "Git Provider"
4. 您應該能看到 `bible-memorize` 倉庫
5. 選擇該倉庫
6. 繼續部署配置

## ✅ 檢查清單

- [ ] Git 倉庫已初始化
- [ ] `.gitignore` 已正確設置
- [ ] 敏感文件不會被提交
- [ ] 文件已添加到 Git
- [ ] 已提交更改
- [ ] GitHub 倉庫已創建
- [ ] 遠程倉庫已添加
- [ ] 代碼已推送到 GitHub
- [ ] GitHub 上確認沒有敏感文件
- [ ] 可以在 Render 中看到倉庫

## 🔗 相關鏈接

- **GitHub 創建倉庫**: https://github.com/new
- **GitHub Personal Access Tokens**: https://github.com/settings/tokens
- **Render Dashboard**: https://dashboard.render.com/

## 💡 提示

1. **使用 Private 倉庫**：如果項目包含敏感信息，建議使用私有倉庫
2. **定期提交**：養成定期提交和推送的習慣
3. **提交信息**：使用清晰的提交信息，方便追蹤更改
4. **分支管理**：可以創建 `main` 和 `develop` 分支進行開發

## 🆘 常見問題

### 問題：推送時要求認證

**解決**：使用 Personal Access Token 而不是密碼

### 問題：敏感文件被提交

**解決**：
1. 從 Git 中移除：`git rm --cached <file>`
2. 更新 `.gitignore`
3. 重新提交和推送
4. 重新生成敏感文件

### 問題：找不到倉庫

**解決**：
1. 確認倉庫名稱正確
2. 確認已正確推送
3. 刷新 Render 頁面
