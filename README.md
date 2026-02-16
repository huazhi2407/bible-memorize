# 經文背誦

錄音儲存、週曆簽到，搭配登入與管理員功能。

## 功能

- **註冊 / 登入**：輸入名字 + 密碼註冊，系統會給一組**編號**；登入可用「名字」或「編號」+ 密碼。
- **錄音**：登入後可錄音（webm），直接上傳並存到後端，可回放、刪除自己的錄音。
- **週曆簽到**：完成背誦後可「今日簽到」，週曆表格會顯示該週已簽到的日期。
- **管理員**：以管理員帳號登入後可進入「管理員」頁面：
  - 查看、刪除使用者帳號（刪除時會一併刪除該使用者的錄音與簽到）。
  - 查看全部錄音（依使用者與時間）、刪除任一錄音。

## 環境需求

- **Node.js** 18+

## 預設管理員

首次啟動後端時，若資料庫尚無任何使用者，會自動建立一位管理員：

- 帳號：**admin**
- 密碼：**admin123**（或設定環境變數 `ADMIN_PASSWORD` 覆蓋）

請在首次登入後盡快修改密碼或自行新增管理員後刪除預設帳號。

## 安裝與執行

```bash
# 安裝依賴（根目錄 + server + client）
npm run install:all

# 同時啟動後端與前端
npm run dev
```

- 前端：http://localhost:5173  
- 後端：http://localhost:3001  

### 本機 production 測試

```bash
npm run build
npm run start
```

完成後開啟 **http://localhost:3001**（單一 port 提供整站）。

## 部署（Render）

1. 將專案推送到 GitHub，並確認根目錄有 `render.yaml`。
2. 到 [Render](https://render.com) → **New** → **Blueprint**，連動 repo。
3. 環境變數（選填）：
   - **ADMIN_PASSWORD**：預設管理員密碼（若未設則為 `admin123`）。
   - **JWT_SECRET**：JWT 簽章用密鑰（建議設定）。
4. 儲存後會執行 `npm run build` 與 `npm run start`。

**注意**：Render 免費方案重啟後本機磁碟會清空，錄音檔與 SQLite 資料庫會重置。若需持久化，請使用付費方案或外接資料庫／儲存。
