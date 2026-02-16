# Firestore 連接問題排查指南

## 錯誤：5 NOT_FOUND

即使 Firestore 數據庫已創建，仍可能出現此錯誤。

## ✅ 確認事項

根據您的截圖，以下配置是正確的：
- ✅ Firestore 數據庫已創建（名稱：default）
- ✅ 模式：Native（正確）
- ✅ 位置：asia-east1
- ✅ 版本：Standard

## 🔍 可能的原因和解決方案

### 1. Firestore API 未啟用

**檢查步驟：**
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇項目：`bible-memorize-38d24`
3. 前往「API 和服務」→「已啟用的 API」
4. 搜索 "Cloud Firestore API"
5. 確認已啟用

**如果未啟用：**
1. 點擊「啟用 API」
2. 等待幾分鐘讓 API 生效
3. 重新測試連接

### 2. 服務帳號權限不足

**檢查步驟：**
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇項目：`bible-memorize-38d24`
3. 前往「IAM 和管理」→「服務帳戶」
4. 找到您的服務帳號（通常是 `firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com`）
5. 確認角色包含：
   - `Cloud Datastore User` 或
   - `Firebase Admin SDK Administrator Service Agent`

**如果權限不足：**
1. 點擊服務帳號
2. 點擊「授予訪問權限」
3. 添加角色：`Cloud Datastore User`
4. 保存
5. 重新下載服務帳號 JSON 文件

### 3. 項目 ID 不匹配

**檢查步驟：**
1. 打開 `firebase-service-account.json`
2. 確認 `project_id` 是 `bible-memorize-38d24`
3. 確認與 Firebase Console 中的項目 ID 一致

### 4. 數據庫位置問題

**檢查步驟：**
1. Firebase Console → Firestore Database
2. 確認數據庫位置是 `asia-east1`
3. 確認服務帳號區域與數據庫位置一致

### 5. Firestore 數據庫 ID

如果創建了多個數據庫，可能需要指定數據庫 ID。

**檢查步驟：**
1. Firebase Console → Firestore Database
2. 確認數據庫名稱是 `default`
3. 如果是其他名稱，需要在代碼中指定

## 🧪 測試步驟

### 步驟 1：啟用 Firestore API

```bash
# 使用 gcloud CLI（如果已安裝）
gcloud services enable firestore.googleapis.com --project=bible-memorize-38d24
```

或通過 Google Cloud Console：
1. 前往 https://console.cloud.google.com/apis/library
2. 搜索 "Cloud Firestore API"
3. 點擊「啟用」

### 步驟 2：檢查服務帳號權限

1. 前往 https://console.cloud.google.com/iam-admin/serviceaccounts
2. 選擇項目：`bible-memorize-38d24`
3. 找到服務帳號並檢查角色

### 步驟 3：重新下載服務帳號

1. Firebase Console → 項目設置 → 服務帳戶
2. 點擊「生成新的私密金鑰」
3. 下載 JSON 文件
4. 替換 `server-firebase/firebase-service-account.json`

### 步驟 4：測試連接

```bash
cd server-firebase
node test-firebase.js
```

## 📞 如果問題持續

請提供以下信息：
1. Google Cloud Console → API 和服務 → 已啟用的 API（截圖）
2. 服務帳號的 IAM 角色（截圖）
3. `firebase-service-account.json` 中的 `project_id`（不要分享完整文件）
4. 完整的錯誤訊息和堆疊追蹤

## 🔗 相關鏈接

- [Firebase Admin SDK 文檔](https://firebase.google.com/docs/admin/setup)
- [Firestore API 啟用](https://console.cloud.google.com/apis/library/firestore.googleapis.com)
- [服務帳號權限](https://console.cloud.google.com/iam-admin/serviceaccounts)
