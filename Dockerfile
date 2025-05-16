# 第一阶段：构建阶段
FROM node:lts-alpine AS builder

WORKDIR /app

# 先复制 package.json 和 package-lock.json，利用缓存
COPY package*.json ./

# 安装所有依赖
RUN npm install

# 复制项目文件
COPY . .

# 执行构建命令
RUN npm run build

# 清理开发依赖，只保留生产依赖
RUN npm prune --production

# 第二阶段：运行阶段
FROM node:lts-alpine

WORKDIR /app

# 从构建阶段复制必要的文件
COPY --from=builder /app/bundle.js ./bundle.js

# 启动命令
CMD ["node", "bundle.js"]
