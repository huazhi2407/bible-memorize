# GitHub 認證替代方案

## 🔐 不使用 Token 密碼的方法

有幾種方式可以避免每次推送時輸入 token：

### 方法 1：使用 SSH（推薦）

#### 步驟 1：檢查是否已有 SSH 密鑰

```bash
# 檢查是否有 SSH 密鑰
ls ~/.ssh/id_rsa.pub
# 或 Windows PowerShell
Test-Path $env:USERPROFILE\.ssh\id_rsa.pub
```

#### 步驟 2：生成 SSH 密鑰（如果沒有）

```bash
# 生成 SSH 密鑰（替換 your_email@example.com）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按 Enter 使用默認路徑
# 可以設置密碼或直接按 Enter（無密碼）
```

#### 步驟 3：複製公鑰

```bash
# Windows PowerShell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard

# 或手動複製
cat ~/.ssh/id_ed25519.pub
```

#### 步驟 4：添加到 GitHub

1. 前往：https://github.com/settings/keys
2. 點擊「**New SSH key**」
3. **Title**：輸入描述（例如：My Computer）
4. **Key**：貼上剛才複製的公鑰
5. 點擊「**Add SSH key**」

#### 步驟 5：更改遠程 URL 為 SSH

```bash
cd c:\Users\jerey\bible-memorize

# 移除 HTTPS 遠程
git remote remove origin

# 添加 SSH 遠程
git remote add origin git@github.com:huazhi2407/bible-memorize.git

# 驗證
git remote -v
```

#### 步驟 6：推送（無需密碼）

```bash
git push -u origin main
```

### 方法 2：使用 GitHub CLI（gh）

#### 步驟 1：安裝 GitHub CLI

下載並安裝：https://cli.github.com/

#### 步驟 2：登入

```bash
gh auth login
```

選擇：
- GitHub.com
- HTTPS
- 在瀏覽器中認證

#### 步驟 3：推送

```bash
git push -u origin main
```

### 方法 3：使用 Git Credential Manager（Windows）

Windows 通常已內建 Git Credential Manager，可以保存認證信息。

#### 步驟 1：使用 HTTPS 推送一次

```bash
cd c:\Users\jerey\bible-memorize
git push -u origin main
```

當提示輸入密碼時：
- 用戶名：`huazhi2407`
- 密碼：使用 Personal Access Token（僅此一次）

#### 步驟 2：認證信息會被保存

Windows Credential Manager 會保存認證信息，之後推送時不需要再輸入。

### 方法 4：在 URL 中包含 Token（不推薦，但簡單）

```bash
cd c:\Users\jerey\bible-memorize

# 移除舊的遠程
git remote remove origin

# 添加包含 token 的 URL（替換 YOUR_TOKEN）
git remote add origin https://YOUR_TOKEN@github.com/huazhi2407/bible-memorize.git

# 推送
git push -u origin main
```

⚠️ **注意**：這種方式會將 token 保存在 Git 配置中，安全性較低。

## 🎯 推薦方案

### 最佳選擇：SSH（方法 1）

**優點**：
- ✅ 不需要每次輸入密碼
- ✅ 更安全
- ✅ 一次設置，永久使用

**缺點**：
- 需要設置 SSH 密鑰

### 簡單選擇：Git Credential Manager（方法 3）

**優點**：
- ✅ Windows 已內建
- ✅ 設置簡單
- ✅ 只需輸入一次 token

**缺點**：
- 需要輸入一次 token

## 🚀 快速設置 SSH（推薦）

如果您想使用 SSH，我可以幫您設置：

1. **檢查是否已有 SSH 密鑰**
2. **如果沒有，生成新的 SSH 密鑰**
3. **顯示公鑰供您添加到 GitHub**
4. **更改遠程 URL 為 SSH**
5. **測試推送**

## 💡 建議

對於您的情況，我建議：

1. **短期**：使用 Git Credential Manager（方法 3）
   - 只需輸入一次 token
   - Windows 會自動保存

2. **長期**：設置 SSH（方法 1）
   - 更安全
   - 更方便

您想使用哪種方法？我可以幫您設置。
