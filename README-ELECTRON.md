# 打包成桌面應用程式

這個專案可以使用 Electron 打包成桌面應用程式。

## 安裝依賴

```bash
npm run install:all
npm install
```

## 開發模式（Electron）

```bash
npm run electron:dev
```

這會啟動後端服務器，然後打開 Electron 窗口。

## 打包應用程式

### Windows

```bash
npm run electron:build:win
```

打包完成後，安裝程式會在 `dist-electron` 目錄中。

### macOS

```bash
npm run electron:build:mac
```

### Linux

```bash
npm run electron:build:linux
```

## 打包說明

- **Windows**: 會生成 `.exe` 安裝程式（NSIS）
- **macOS**: 會生成 `.dmg` 安裝檔
- **Linux**: 會生成 `.AppImage` 可執行檔

## 數據存儲位置

打包後的應用程式會將數據存儲在：

- **Windows**: `C:\Users\<用戶名>\AppData\Roaming\bible-memorize\`
- **macOS**: `~/Library/Application Support/bible-memorize/`
- **Linux**: `~/.config/bible-memorize/`

## 注意事項

1. 首次打包需要下載 Electron 二進制文件，可能需要一些時間
2. 打包前請確保已經運行過 `npm run build` 構建前端
3. 如果需要自定義圖標，請將圖標文件放在 `build/` 目錄：
   - Windows: `build/icon.ico`
   - macOS: `build/icon.icns`
   - Linux: `build/icon.png`
