import path from 'path';
import fs from 'fs';
import { SpeechClient } from '@google-cloud/speech';
import { convertWebmToWav } from './ffmpeg.js';
import { computeAccuracy } from './accuracy.js';
import { correctHomophones } from './homophones.js';

const speechClient = new SpeechClient();

/**
 * 處理錄音：轉 wav → 語音辨識 → 計算準確率
 * @param {string} webmPath - 原始 webm 路徑（已存檔）
 * @param {string} referenceText - 參考經文（用於 Speech Context 與準確率）
 */
export async function processRecording(webmPath, referenceText) {
  let wavPath = null;
  try {
    wavPath = await convertWebmToWav(webmPath);
    const text = await recognizeSpeech(wavPath, referenceText);
    const accuracy = referenceText
      ? computeAccuracy(text, referenceText)
      : null;
    const correctedText =
      referenceText && text ? correctHomophones(text, referenceText) : null;
    return { text, accuracy, correctedText };
  } finally {
    if (wavPath && fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
  }
}

async function recognizeSpeech(wavPath, referenceText) {
  const audioBytes = fs.readFileSync(wavPath).toString('base64');

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'zh-TW',
    enableAutomaticPunctuation: false,
  };

  // 同音字優化：提供參考經文作為 phrase hints，讓 API 傾向辨識出正確用字
  if (referenceText) {
    config.speechContexts = [
      {
        phrases: [referenceText],
        boost: 20,
      },
    ];
  }

  const [response] = await speechClient.recognize({
    audio: { content: audioBytes },
    config,
  });

  const transcript =
    response.results
      ?.map((r) => r.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join('') || '';

  return transcript.trim();
}
