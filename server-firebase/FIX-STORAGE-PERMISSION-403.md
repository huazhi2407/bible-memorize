# 修復 Storage 403：服務帳號沒有寫入權限

錯誤訊息：`firebase-adminsdk-fbsvc@bible-memorize-new.iam.gserviceaccount.com does not have storage.objects.create access`

表示 **Firebase 服務帳號** 沒有 Google Cloud Storage 的寫入權限，需要手動在 Google Cloud 加入權限。

---

## 解決步驟

### 1. 打開 Google Cloud Console

1. 前往 **[Google Cloud Console](https://console.cloud.google.com/)**
2. 左上角選擇專案：**bible-memorize-new**（與 Firebase 同專案）

### 2. 進入 IAM 頁面

1. 左側選單點 **「IAM 與管理」**（或搜尋 **IAM**）
2. 點 **「IAM」**（管理員 → IAM）

### 3. 找到並編輯服務帳號

1. 在成員列表中找 **`firebase-adminsdk-fbsvc@bible-memorize-new.iam.gserviceaccount.com`**
   - 若找不到：點上方 **「授權存取權」**，在「新增成員」的欄位貼上這個 email，再繼續下面步驟
2. 點該成員右側的 **鉛筆圖示（編輯）**

### 4. 新增 Storage 角色

1. 點 **「新增其他角色」**（或「Add another role」）
2. 在角色下拉選單中選：
   - **Cloud Storage** → **Storage 物件管理員**（Storage Object Admin）  
   - 或搜尋：`Storage Object Admin` / `roles/storage.objectAdmin`
3. 選好後點 **「儲存」**

### 5. 等待生效

- 權限約 1～2 分鐘內生效
- 生效後再試一次 **上傳錄音**

---

## 若找不到「Storage 物件管理員」

可改用較大權限（專案層級）：

1. 同上進入 IAM → 編輯該服務帳號
2. 新增角色選：**Cloud Storage** → **Storage 管理員**（Storage Admin）
3. 儲存

這樣該服務帳號就能在專案內所有 Storage bucket 讀寫。

---

## 只授權單一 Bucket（進階、可選）

若只想授權 `bible-memorize-new.firebasestorage.app` 這個 bucket：

1. 左側選單 **Cloud Storage** → **儲存區**
2. 點 bucket **bible-memorize-new.firebasestorage.app**
3. 點 **「權限」** 分頁
4. **「新增成員」**，成員填：`firebase-adminsdk-fbsvc@bible-memorize-new.iam.gserviceaccount.com`
5. 角色選 **「Storage 物件管理員」**
6. 儲存

---

## 檢查清單

- [ ] 已在 Google Cloud Console 選擇專案 **bible-memorize-new**
- [ ] 在 IAM 找到或新增成員 `firebase-adminsdk-fbsvc@bible-memorize-new.iam.gserviceaccount.com`
- [ ] 已為該成員新增角色 **Storage 物件管理員**（或 Storage 管理員）
- [ ] 已按「儲存」
- [ ] 等待 1～2 分鐘後再試上傳

完成後，上傳錄音應可正常運作。
