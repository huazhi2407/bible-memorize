# 設定正確的 Firebase Storage Bucket 名稱

根據您的 Firebase Console 截圖，您的 Storage bucket 名稱是：
**`bible-memorize-new.firebasestorage.app`**

但程式碼預設使用 `專案ID.appspot.com` 格式，因此需要設定環境變數來指定正確的 bucket。

---

## 🔧 解決步驟

### 在 Render 設定環境變數

1. **前往 Render Dashboard**
   - 打開 https://dashboard.render.com/
   - 選擇您的 **bible-memorize** 服務

2. **前往 Environment 設定**
   - 左側選單點 **Environment**
   - 或點服務名稱 → **Environment** 標籤

3. **新增環境變數**
   - 點 **Add Environment Variable**
   - **Key**: `FIREBASE_STORAGE_BUCKET`
   - **Value**: `bible-memorize-new.firebasestorage.app`
   - 點 **Save Changes**

4. **重新部署**
   - Render 會自動重新部署
   - 或手動點 **Manual Deploy** → **Deploy latest commit**

---

## ✅ 驗證

部署完成後：

1. **檢查 Render 日誌**
   - 應該會看到：`Storage Bucket: bible-memorize-new.firebasestorage.app`

2. **測試上傳**
   - 嘗試上傳錄音
   - 應該不會再出現「bucket does not exist」錯誤

3. **檢查 Firebase Console**
   - 前往 Firebase Console → Storage → Files
   - 應該會看到上傳的檔案出現在 `recordings/` 資料夾中

---

## 📝 說明

程式碼已更新，會優先使用 `FIREBASE_STORAGE_BUCKET` 環境變數：
- ✅ 如果設定了 `FIREBASE_STORAGE_BUCKET`，使用該值
- ✅ 如果沒設定，才使用預設的 `專案ID.appspot.com`

因為您的 bucket 名稱是 `bible-memorize-new.firebasestorage.app`（不是 `.appspot.com` 格式），所以**必須設定環境變數**。

---

設定完成後，上傳功能應該就能正常運作了！🎉
