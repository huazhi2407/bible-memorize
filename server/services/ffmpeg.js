import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpegStatic = require('ffmpeg-static');
const ffmpegPath = typeof ffmpegStatic === 'string' ? ffmpegStatic : (ffmpegStatic?.default ?? '');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '..', 'temp');

function ensureTempDir() {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

/**
 * 將 webm 轉成 16kHz mono wav（僅用於辨識，不存檔）
 * 使用 ffmpeg-static 內建二進位，無需系統安裝 ffmpeg
 */
export function convertWebmToWav(webmPath) {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static 未正確載入，請重新安裝依賴');
  }
  ensureTempDir();
  const basename = path.basename(webmPath, path.extname(webmPath));
  const wavPath = path.join(tempDir, `${basename}.wav`);
  const bin = path.normalize(ffmpegPath);

  try {
    execSync(
      `"${bin}" -y -i "${webmPath}" -ar 16000 -ac 1 -f wav "${wavPath}"`,
      { stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 }
    );
  } catch (e) {
    throw new Error('轉檔失敗: ' + (e.message || e));
  }

  return wavPath;
}
