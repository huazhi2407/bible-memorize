# Firestore 複合索引說明

若出現 500 錯誤且日誌中有 `The query requires an index`，需在 Firebase Console 建立複合索引。

## 方式一：依錯誤連結建立（建議）

1. 到 Render Dashboard → 您的服務 → **Logs**
2. 找到錯誤訊息，會包含一則類似：
   ```
   The query requires an index. You can create it here: https://console.firebase.google.com/...
   ```
3. 點擊該連結，在 Firebase Console 中建立索引，等待幾分鐘完成。

## 方式二：手動建立

1. 打開 [Firebase Console](https://console.firebase.google.com/) → 選擇專案
2. 左側 **Firestore Database** → 上方 **索引 (Indexes)** 分頁
3. 點 **建立索引**，依下表建立：

### 1. checkins 集合（簽到查詢）

- **集合 ID**：`checkins`
- **欄位**：
  - `user_id`：升序
  - `date`：升序
- **查詢範圍**：集合

### 2. recordings 集合（錄音列表）

- **集合 ID**：`recordings`
- **欄位**：
  - `user_id`：升序
  - `created_at`：降序
- **查詢範圍**：集合

建立完成後等待狀態變為「已啟用」，再重試 API。
