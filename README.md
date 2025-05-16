# sryzen

## 项目简介
`sryzen` 是一个基于 Node.js 的 WebSocket 应用，使用 `ws` 库实现 WebSocket 功能。项目支持 Docker 容器化部署，包含构建和运行阶段，能够自动重启服务。

## 安装步骤
### 本地安装
1. 确保你已经安装了 Node.js 和 npm。
2. 克隆项目仓库到本地：
```bash
  git clone <仓库地址>
  cd sryzen
```
3. 安装项目依赖：
```bash
  npm install
```

### Docker 安装
1. 确保你已经安装了 Docker。
2. 构建 Docker 镜像：
```bash
  docker build -t sryzen .
```

## 运行命令
### 本地运行
1. 构建项目：
```bash
  npm run build
```
2. 启动服务：
```bash
  npm start
```

### Docker 运行
```bash
  docker run -p 3000:3000 sryzen
```

## 代码结构说明
```
├── .git/                  # Git 版本控制目录
├── .gitignore             # Git 忽略文件
├── Dockerfile             # Docker 构建文件
├── README.md              # 项目说明文件
├── bundle.js              # 构建后的打包文件
├── index.js               # 项目入口文件
├── node_modules/          # 项目依赖目录
├── package-lock.json      # 依赖版本锁定文件
└── package.json           # 项目配置文件
```

## 使用示例
在浏览器或客户端中连接 WebSocket 服务：
```javascript
  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    console.log('Connected to the server');
    socket.send('Hello, server!');
  };

  socket.onmessage = (event) => {
    console.log('Received message:', event.data);
  };

  socket.onclose = () => {
    console.log('Disconnected from the server');
  };
```

## 注意事项
- 请确保 Node.js 版本为 LTS 版本。
- Docker 运行时请根据实际情况调整端口映射。

## 贡献
如果你想为该项目做出贡献，请提交 Pull Request 或创建 Issue。

## 许可证
本项目采用 [MIT 许可证](LICENSE)。