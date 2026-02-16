import { app, BrowserWindow, shell } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow = null;
let serverProcess = null;

// 啟動後端服務器
function startServer() {
  const serverPath = isDev 
    ? join(__dirname, '..', 'server', 'index.js')
    : join(process.resourcesPath, 'server', 'index.js');
  
  // 在打包環境中，使用系統的 Node.js 或 Electron 內建的 Node.js
  let nodePath;
  if (isDev) {
    // 開發環境：嘗試找到系統的 node
    try {
      if (process.platform === 'win32') {
        nodePath = execSync('where node', { encoding: 'utf-8' }).trim().split('\n')[0];
      } else {
        nodePath = execSync('which node', { encoding: 'utf-8' }).trim();
      }
    } catch {
      nodePath = 'node'; // 如果找不到，使用 PATH 中的 node
    }
  } else {
    // 打包環境：使用 Electron 的 Node.js
    nodePath = process.execPath;
  }
  
  // 設置用戶數據目錄
  const userDataDir = join(app.getPath('userData'), 'bible-memorize');
  
  console.log('Starting server from:', serverPath);
  console.log('Node path:', nodePath);
  console.log('User data directory:', userDataDir);
  
  serverProcess = spawn(nodePath, [serverPath], {
    cwd: isDev ? join(__dirname, '..', 'server') : join(process.resourcesPath, 'server'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3001',
      ELECTRON: 'true',
      USER_DATA_DIR: userDataDir,
    },
    stdio: 'inherit',
  });

  serverProcess.on('error', (err) => {
    console.error('Server process error:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error('Server crashed!');
    }
  });
}

// 創建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    icon: join(__dirname, '..', 'build', 'icon.png'),
    titleBarStyle: 'default',
  });

  // 等待服務器啟動後載入頁面
  const checkServer = setInterval(() => {
    fetch('http://localhost:3001/api/auth/login', { method: 'POST' })
      .then(() => {
        clearInterval(checkServer);
        mainWindow.loadURL('http://localhost:3001');
      })
      .catch(() => {
        // 服務器還沒啟動，繼續等待
      });
  }, 500);

  // 超時處理
  setTimeout(() => {
    clearInterval(checkServer);
    mainWindow.loadURL('http://localhost:3001');
  }, 10000);

  // 處理外部鏈接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// 應用準備就緒
app.whenReady().then(() => {
  startServer();
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口關閉時退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

// 應用退出前清理
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// 處理異常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
