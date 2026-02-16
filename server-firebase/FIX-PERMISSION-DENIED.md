# 修復 Firestore 權限錯誤（PERMISSION_DENIED）

## ✅ 好消息

錯誤從 `5 NOT_FOUND` 變成了 `7 PERMISSION_DENIED`，這表示：
- ✅ Firestore 數據庫已找到
- ✅ 連接正常
- ❌ 但權限不足

## 🔍 問題原因

`7 PERMISSION_DENIED` 錯誤通常是因為：
1. **Firestore 安全規則太嚴格**（最常見）
2. **服務帳戶權限不足**

## 🛠️ 解決方案

### 方案 1：修改 Firestore 安全規則（推薦用於開發）

由於您使用 Firebase Admin SDK，安全規則主要作為防禦層。對於開發階段，可以設置較寬鬆的規則。

#### 步驟 1：前往 Firestore 規則頁面

1. 前往 Firebase Console
2. 選擇您的項目
3. 點擊「Firestore Database」
4. 點擊「規則」標籤

#### 步驟 2：設置開發模式規則

複製以下規則並替換現有規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開發模式：允許已認證用戶訪問
    // 注意：由於使用 Admin SDK，這個規則主要作為防禦層
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**或者，如果 Admin SDK 需要完全訪問，可以暫時使用：**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 測試模式：允許所有訪問（僅用於開發）
    // ⚠️ 生產環境必須改為嚴格規則
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### 步驟 3：發布規則

1. 點擊「**發布**」按鈕
2. 等待規則生效（通常幾秒鐘）

### 方案 2：檢查服務帳戶權限

即使使用 Admin SDK，也需要確保服務帳戶有正確的權限。

#### 步驟 1：檢查 IAM 權限

1. 前往 [Google Cloud Console - IAM](https://console.cloud.google.com/iam-admin/iam)
2. 選擇您的項目
3. 搜索服務帳戶（通常是 `firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com`）
4. 確認有 `Cloud Datastore User` 角色

#### 步驟 2：添加權限（如果沒有）

1. 點擊「**授予訪問權限**」
2. 輸入服務帳戶電子郵件
3. 添加角色：`Cloud Datastore User`
4. 保存

## 🧪 測試修復

修改規則後，等待幾秒鐘，然後運行：

```bash
cd server-firebase
node test-firestore-direct.js
```

應該看到：
- ✅ 方法 1 成功
- ✅ 方法 2 成功
- ✅ 方法 3 成功（寫入成功）

## 📋 推薦配置

### 開發階段

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // 允許所有訪問
    }
  }
}
```

### 生產環境

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // 拒絕所有直接訪問，只通過 Admin SDK
    }
  }
}
```

## ⚠️ 重要提示

1. **Admin SDK 繞過規則**：Firebase Admin SDK 擁有完整權限，會繞過安全規則
2. **規則作為防禦層**：安全規則主要防止直接客戶端訪問
3. **開發 vs 生產**：開發階段可以使用寬鬆規則，生產環境必須嚴格

## 🔗 直接鏈接

**Firestore 規則頁面**：
- 前往 Firebase Console → Firestore Database → 規則

**IAM 權限頁面**：
- https://console.cloud.google.com/iam-admin/iam

## 💡 為什麼會出現這個錯誤？

即使使用 Admin SDK，如果 Firestore 規則設置為 `allow read, write: if false;`，某些操作可能會被拒絕。這是因為：

1. Admin SDK 通常會繞過規則
2. 但在某些情況下，規則仍會生效
3. 特別是當規則明確拒絕所有訪問時

**解決方法**：設置規則為允許 Admin SDK 訪問，或確保服務帳戶有正確的 IAM 權限。
