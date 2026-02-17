# 修復「The specified bucket does not exist」錯誤

此錯誤表示 **Firebase Storage 的儲存區（bucket）不存在**，需要先在 Firebase 專案中啟用並建立預設 bucket。

---

## 解決步驟

### 1. 在 Firebase Console 啟用 Storage

1. 打開 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案（與服務帳號相同的專案）
3. 左側選單點 **Build** → **Storage**
4. 若看到「Get started」或「開始使用」，點下去
5. 依畫面設定：
   - **安全規則**：可先選「測試模式」或使用預設，之後再改
   - **儲存位置**：選一個離您用戶較近的區域（例如 `asia-east1`）
6. 點「完成」建立 **預設 bucket**

預設 bucket 名稱通常是：**`<您的專案 ID>.appspot.com`**

---

### 2. 確認專案 ID

- 在 Firebase Console 左側齒輪 → **專案設定** → **一般** 可看到 **專案 ID**
- 服務帳號 JSON 裡的 `project_id` 應與此相同
- 預設 bucket 即為：`專案ID.appspot.com`

---

### 3. 若 bucket 名稱不同（自訂或新版格式）

若您已有自訂 bucket 或 Firebase 顯示的 bucket 名稱不是 `專案ID.appspot.com`：

1. 在 Firebase Console → **Storage** 頁面頂部可看到目前 bucket 名稱
2. 在 **Render** 的該服務 **Environment** 中新增：
   - **Key**: `FIREBASE_STORAGE_BUCKET`
   - **Value**: 該 bucket 名稱（例如 `my-project.firebasestorage.app` 或自訂名稱）
3. 儲存後重新部署服務

程式會優先使用 `FIREBASE_STORAGE_BUCKET`，沒設定時才用 `專案ID.appspot.com`。

---

### 4. 重新部署後再測試

1. 在 Firebase 完成「啟用 Storage + 建立預設 bucket」
2. 若有用自訂 bucket，在 Render 設好 `FIREBASE_STORAGE_BUCKET` 並重新部署
3. 再試一次錄音上傳

---

## 總結

| 狀況 | 作法 |
|------|------|
| 從未用過 Storage | Firebase Console → Storage → 開始使用 → 建立預設 bucket |
| Bucket 名稱不是 `專案ID.appspot.com` | 在 Render 設定環境變數 `FIREBASE_STORAGE_BUCKET` = 實際 bucket 名稱 |
| 仍 404 | 確認服務帳號的專案與 Firebase Console 的專案一致，且該專案下 Storage 已啟用 |

完成後，上傳錯誤應會消失；若仍有錯誤，可把 Render 日誌中的新錯誤訊息貼出。
