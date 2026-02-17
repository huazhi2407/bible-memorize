# GitHub 設置指南

## ✅ 已完成

- ✅ Git 倉庫已初始化
- ✅ 文件已添加到 Git
- ✅ 敏感文件已正確排除（firebase-service-account.json, .env）
- ✅ 更改已提交

## 📋 下一步：在 GitHub 創建倉庫並推送

### 步驟 1：在 GitHub 創建新倉庫

1. **前往 GitHub**：https://github.com/new

2. **填寫倉庫信息**：
   - **Repository name**: `bible-memorize`
   - **Description**: `經文背誦應用 - 錄音、簽到、積分系統`
   - **Visibility**: 
     - ✅ **Private**（推薦，保護敏感信息）
     - 或 Public（公開）
   - **不要勾選**：
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license

3. **點擊「Create repository」**

### 步驟 2：記下倉庫 URL

創建後，GitHub 會顯示倉庫 URL，例如：
```
https://github.com/your-username/bible-memorize.git
```

### 步驟 3：添加遠程倉庫並推送

在終端中運行以下命令（替換 `your-username` 為您的 GitHub 用戶名）：

```bash
cd c:\Users\jerey\bible-memorize

# 添加遠程倉庫
git remote add origin https://github.com/your-username/bible-memorize.git

# 設置主分支為 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 步驟 4：認證

如果提示輸入用戶名和密碼：
- **用戶名**：您的 GitHub 用戶名
- **密碼**：使用 **Personal Access Token**（不是 GitHub 密碼）

#### 如何創建 Personal Access Token：

1. 前往：https://github.com/settings/tokens
2. 點擊「**Generate new token**」→「**Generate new token (classic)**」
3. **Note**：輸入描述，例如「bible-memorize deployment」
4. **Expiration**：選擇過期時間（建議 90 天或 No expiration）
5. **Select scopes**：勾選 `repo`（完整倉庫權限）
6. 點擊「**Generate token**」
7. **複製 token**（只顯示一次，請保存好）
8. 使用這個 token 作為密碼

### 步驟 5：驗證推送

1. 前往您的 GitHub 倉庫頁面
2. 確認所有文件都已上傳
3. **確認**：`firebase-service-account.json` 和 `.env` 文件**沒有**出現在文件列表中

## ✅ 完成後

推送成功後，您可以在 Render 中：
1. 返回 Render Dashboard
2. 在 "New Web Service" → "Source Code"
3. 選擇 "Git Provider"
4. 選擇 `bible-memorize` 倉庫
5. 繼續部署配置

## 🔗 快速鏈接

- **創建 GitHub 倉庫**：https://github.com/new
- **Personal Access Tokens**：https://github.com/settings/tokens
- **Render Dashboard**：https://dashboard.render.com/

## 💡 提示

1. **使用 Private 倉庫**：保護敏感信息
2. **保存 Token**：Personal Access Token 只顯示一次，請保存好
3. **定期推送**：養成定期提交和推送的習慣

## 🆘 如果遇到問題

### 問題：認證失敗

**解決**：
- 確認使用 Personal Access Token 而不是密碼
- 確認 token 有 `repo` 權限

### 問題：找不到倉庫

**解決**：
- 確認倉庫名稱正確
- 確認已正確推送
- 刷新 Render 頁面
