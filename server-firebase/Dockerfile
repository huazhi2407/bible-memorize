# 使用 Node.js 18 作為基礎映像
FROM node:18-slim

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用代碼
COPY . .

# 暴露端口（HuggingFace Spaces 使用 7860，但我們可以通過環境變量配置）
EXPOSE 7860

# 設置環境變量
ENV NODE_ENV=production
ENV PORT=7860

# 啟動應用
CMD ["node", "index.js"]
