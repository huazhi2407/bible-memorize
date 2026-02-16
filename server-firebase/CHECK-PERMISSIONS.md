# 檢查服務帳戶權限

## 🔍 當前問題

即使 Cloud Firestore API 已啟用，仍然出現錯誤 `5 NOT_FOUND`。這通常表示**服務帳戶權限不足**。

## ✅ 必須檢查的服務帳戶

**Firebase Admin SDK 使用的服務帳戶：**
```
firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com
```

## 📋 檢查步驟

### 步驟 1：找到正確的服務帳戶

1. 前往 [Google Cloud Console - 服務帳戶](https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24)
2. 在搜索框中輸入：`firebase-adminsdk-fbsvc`
3. 找到服務帳戶：`firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com`
4. **點擊服務帳戶名稱**（不是旁邊的三點菜單）

### 步驟 2：檢查權限

1. 在服務帳戶詳情頁面，點擊「**權限**」標籤
2. 查看「**授予此服務帳戶的角色**」列表
3. **確認有以下角色之一：**
   - ✅ `Cloud Datastore User`（推薦）
   - ✅ `Firebase Admin SDK Administrator Service Agent`
   - ✅ `Owner`
   - ✅ `Editor`

### 步驟 3：如果沒有適當的權限

1. 點擊頁面頂部的「**授予訪問權限**」按鈕
2. 在「**新主體**」欄位中，輸入：
   ```
   firebase-adminsdk-fbsvc@bible-memorize-38d24.iam.gserviceaccount.com
   ```
3. 在「**選擇角色**」下拉菜單中，選擇：
   ```
   Cloud Datastore User
   ```
4. 點擊「**保存**」
5. **等待 2-3 分鐘**讓權限生效

## 🔗 直接鏈接

**檢查服務帳戶權限：**
https://console.cloud.google.com/iam-admin/serviceaccounts?project=bible-memorize-38d24

**搜索服務帳戶：**
在搜索框中輸入：`firebase-adminsdk-fbsvc`

## ⚠️ 重要提示

1. **不要使用截圖中的服務帳戶**（`bible-memorize@bible-memorize.iam.gserviceaccount.com`）
2. **必須使用 Firebase Admin SDK 服務帳戶**（`firebase-adminsdk-fbsvc@...`）
3. **權限生效需要時間**（通常 2-3 分鐘）
4. **如果找不到服務帳戶**，可能需要重新下載服務帳戶 JSON 文件

## 🧪 測試權限

添加權限後，等待 2-3 分鐘，然後運行：

```bash
cd server-firebase
node test-firestore-direct.js
```

如果看到「✅ 方法 3 成功（寫入成功）」，表示權限已正確設置。
