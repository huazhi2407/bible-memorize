# 修復 Firestore 連接問題

## ✅ 已確認正確的配置

根據檢查：
- ✅ 服務帳戶文件正確：`firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com`
- ✅ 項目 ID 正確：`bible-memorize-38d24`
- ✅ Firestore 數據庫已創建（Native 模式，位置：asia-east1）

## 🔍 需要檢查的項目

### 1. Cloud Firestore API 是否啟用（最重要）

**步驟：**
1. 前往 [Google Cloud Console - API 庫](https://console.cloud.google.com/apis/library?project=bible-memorize-38d24)
2. 搜索 "Cloud Firestore API"
3. 點擊結果
4. **確認顯示「已啟用」**（綠色勾選標記）

**如果顯示「啟用」按鈕：**
- 點擊「啟用」
- 等待 1-2 分鐘
- 重新測試

### 2. Firebase Admin SDK 服務帳戶權限

**正確的服務帳戶：**
```
firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com
```

**檢查步驟：**
1. 前往 [Google Cloud Console - 服務帳戶](https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24)
2. 在搜索框中輸入：`firebase-adminsdk-fbsvc`
3. 找到服務帳戶：`firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com`
4. 點擊服務帳戶名稱
5. 點擊「權限」標籤
6. **確認有以下角色之一：**
   - `Cloud Datastore User` ✅
   - `Firebase Admin SDK Administrator Service Agent` ✅
   - `Owner` ✅
   - `Editor` ✅

**如果沒有適當的權限：**
1. 點擊「授予訪問權限」
2. 添加角色：`Cloud Datastore User`
3. 保存
4. 等待幾分鐘讓權限生效

### 3. 確認項目 ID 匹配

**檢查：**
- Firebase Console 項目 ID：`bible-memorize-38d24`
- 服務帳戶項目 ID：`bible-memorize-38d24`
- ✅ 匹配

## 🧪 測試步驟

### 步驟 1：啟用 Cloud Firestore API

```bash
# 方法 1：通過網頁（推薦）
# 前往：https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=bible-memorize-38d24
# 點擊「啟用」

# 方法 2：使用 gcloud CLI（如果已安裝）
gcloud services enable firestore.googleapis.com --project=bible-memorize-38d24
```

### 步驟 2：檢查服務帳戶權限

1. 前往：https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24
2. 搜索：`firebase-adminsdk-fbsvc`
3. 檢查權限

### 步驟 3：測試連接

```bash
cd server-firebase
node test-firebase.js
```

## 📋 快速檢查清單

- [ ] Cloud Firestore API 已啟用（最重要！）
- [ ] Firebase Admin SDK 服務帳戶有 `Cloud Datastore User` 角色
- [ ] 項目 ID 匹配：`bible-memorize-38d24`
- [ ] 數據庫位置：`asia-east1`
- [ ] 數據庫模式：Native

## 🔗 直接鏈接

- **啟用 Cloud Firestore API**：
  https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=bible-memorize-38d24

- **檢查服務帳戶權限**：
  https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24

- **Firebase Console**：
  https://console.firebase.google.com/project/bible-memorize-38d24/firestore

## 💡 常見問題

### Q: 為什麼截圖中的服務帳戶不同？

A: 截圖顯示的是 `bible-memorize@bible-memorize.iam.gserviceaccount.com`，這是 Google 自動創建的服務帳戶。Firebase Admin SDK 使用的是 `firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com`，這是不同的服務帳戶。

### Q: 啟用 API 後多久生效？

A: 通常 1-2 分鐘，但有時可能需要更長時間。如果 5 分鐘後仍然失敗，請檢查其他項目。

### Q: 如何確認 API 已啟用？

A: 前往 API 庫頁面，搜索 "Cloud Firestore API"，應該顯示「已啟用」而不是「啟用」按鈕。
