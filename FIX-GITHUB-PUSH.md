# 修復 GitHub 推送問題

## ❌ 錯誤：Repository not found

這個錯誤通常表示：
1. 倉庫還沒有在 GitHub 上創建
2. 倉庫 URL 不正確
3. 用戶名不正確
4. 權限問題

## 🔍 解決步驟

### 步驟 1：確認倉庫已創建

1. **前往 GitHub**：https://github.com/new
2. **確認倉庫名稱**：`bible-memorize`
3. **確認已創建**：應該能看到倉庫頁面

### 步驟 2：獲取正確的倉庫 URL

在 GitHub 倉庫頁面，點擊綠色的「**Code**」按鈕，複製 HTTPS URL。

URL 格式應該是：
```
https://github.com/YOUR-USERNAME/bible-memorize.git
```

**重要**：替換 `YOUR-USERNAME` 為您的實際 GitHub 用戶名！

### 步驟 3：清除舊的遠程配置並重新添加

```bash
cd c:\Users\jerey\bible-memorize

# 清除舊的遠程配置（如果有的話）
git remote remove origin

# 添加正確的遠程倉庫（替換 YOUR-USERNAME）
git remote add origin https://github.com/YOUR-USERNAME/bible-memorize.git

# 驗證遠程配置
git remote -v
```

應該看到：
```
origin  https://github.com/YOUR-USERNAME/bible-memorize.git (fetch)
origin  https://github.com/YOUR-USERNAME/bible-memorize.git (push)
```

### 步驟 4：推送到 GitHub

```bash
# 設置主分支
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 步驟 5：認證

如果提示輸入用戶名和密碼：
- **用戶名**：您的 GitHub 用戶名
- **密碼**：使用 **Personal Access Token**（不是 GitHub 密碼）

#### 如何創建 Personal Access Token：

1. 前往：https://github.com/settings/tokens
2. 點擊「**Generate new token**」→「**Generate new token (classic)**」
3. **Note**：輸入描述，例如「bible-memorize」
4. **Expiration**：選擇過期時間
5. **Select scopes**：勾選 `repo`（完整倉庫權限）
6. 點擊「**Generate token**」
7. **複製 token**（只顯示一次）
8. 使用這個 token 作為密碼

## 🔗 快速檢查

### 檢查當前配置

```bash
# 查看遠程倉庫配置
git remote -v

# 查看當前分支
git branch
```

### 常見問題

#### 問題 1：倉庫不存在

**解決**：
1. 確認已在 GitHub 創建倉庫
2. 確認倉庫名稱正確
3. 確認用戶名正確

#### 問題 2：權限不足

**解決**：
1. 確認使用 Personal Access Token
2. 確認 token 有 `repo` 權限
3. 確認倉庫是您的（或您有寫入權限）

#### 問題 3：URL 格式錯誤

**正確格式**：
```
https://github.com/USERNAME/REPO-NAME.git
```

**錯誤格式**：
```
https://github.com/your-username/bible-memorize.git/  ❌（末尾不要斜線）
git@github.com:your-username/bible-memorize.git      ✅（SSH 格式，如果已設置）
```

## 📋 完整命令序列

```bash
# 1. 清除舊配置（如果需要）
cd c:\Users\jerey\bible-memorize
git remote remove origin

# 2. 添加正確的遠程倉庫（替換 YOUR-USERNAME）
git remote add origin https://github.com/YOUR-USERNAME/bible-memorize.git

# 3. 驗證配置
git remote -v

# 4. 設置主分支
git branch -M main

# 5. 推送到 GitHub
git push -u origin main
```

## 💡 提示

1. **確認用戶名**：GitHub 用戶名區分大小寫
2. **確認倉庫名稱**：必須完全匹配
3. **使用 Token**：必須使用 Personal Access Token，不能使用密碼
4. **檢查權限**：確認 token 有 `repo` 權限

## 🆘 如果仍然失敗

請提供：
1. 您的 GitHub 用戶名（或確認是否為 `huazhi2407`）
2. 倉庫是否已創建
3. 錯誤的完整訊息

我可以幫您生成正確的命令。
