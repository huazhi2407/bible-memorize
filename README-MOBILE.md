# 手機使用說明

這個應用程式支持在手機上使用，有兩種方式：

## 方式一：PWA（漸進式 Web 應用）- 推薦 ✅

### 優點
- ✅ 不需要安裝應用商店
- ✅ 跨平台（iOS 和 Android 都支持）
- ✅ 可以添加到主屏幕，像原生應用一樣使用
- ✅ 自動更新，無需手動更新

### 使用步驟

#### Android 手機：
1. 在手機瀏覽器（Chrome）中打開應用網址
2. 點擊瀏覽器右上角的「...」選單
3. 選擇「添加到主屏幕」或「安裝應用程式」
4. 確認安裝
5. 應用程式圖標會出現在主屏幕上，點擊即可使用

#### iPhone/iPad：
1. 在 Safari 瀏覽器中打開應用網址
2. 點擊底部的「分享」按鈕（方框+箭頭圖標）
3. 選擇「加入主畫面」
4. 確認添加
5. 應用程式圖標會出現在主屏幕上，點擊即可使用

### 注意事項
- 首次訪問需要在有網絡的環境下
- 之後可以離線使用基本功能（已緩存的頁面）
- 錄音和數據同步需要網絡連接

## 方式二：響應式網頁

直接在手機瀏覽器中訪問應用網址即可使用，無需安裝。

### 優點
- ✅ 即開即用
- ✅ 不需要任何安裝步驟

### 缺點
- ❌ 每次都需要打開瀏覽器輸入網址
- ❌ 沒有離線功能

## 移動端優化

應用已經針對手機進行了優化：
- ✅ 響應式設計，適配各種屏幕尺寸
- ✅ 觸控友好的按鈕和輸入框
- ✅ 優化的字體大小和間距
- ✅ 支持橫屏和豎屏

## 圖標設置

如果需要自定義應用圖標，請將以下尺寸的圖標放在 `client/public/` 目錄：
- `icon-192.png` (192x192 像素)
- `icon-512.png` (512x512 像素)

可以使用在線工具生成這些圖標：
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

## 部署到手機可訪問的服務器

要讓手機訪問，需要將應用部署到一個可以通過網絡訪問的服務器：

### 選項 1：使用 Render/Heroku/Vercel 等雲服務
部署後會獲得一個公開的 URL，手機可以通過這個 URL 訪問。

### 選項 2：使用內網穿透（開發測試）
- 使用 ngrok: `ngrok http 3001`
- 使用 localtunnel: `npx localtunnel --port 3001`
- 獲得臨時 URL，手機可以訪問

### 選項 3：在同一 Wi-Fi 網絡下
- 確保手機和電腦在同一 Wi-Fi 網絡
- 找到電腦的內網 IP（如 192.168.1.100）
- 手機訪問 `http://192.168.1.100:3001`

## 打包成原生應用（進階）

如果需要打包成真正的原生應用（.apk 或 .ipa），可以使用 Capacitor：

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android  # Android
npx cap add ios      # iOS
npx cap sync
npx cap open android # 或 npx cap open ios
```

這需要安裝 Android Studio 或 Xcode。
