const WebSocket = require('ws');
// 从环境变量中获取 COOKIE
const cookie = process.env.COOKIE;

// 检查 COOKIE 是否存在
if (cookie) {
  start(cookie);
} else {
  console.error('COOKIE 环境变量未设置');
}

const TIME = 1000 * 3;
async function restart(cookie) {
    console.log('restart', TIME)
    await new Promise(resolve => setTimeout(resolve, TIME));
    start(cookie)
}
function start(cookie) {
    console.log('start', cookie)
    // 使用 WebSocket 对象来建立 WebSocket 连接
    const socket = new WebSocket("wss://my.sryzen.cloud/ws", {
        headers: {
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
            "sec-websocket-key": "xOpdgSXvxeNA2CDkgloWeQ==",
            "sec-websocket-version": "13",
            "cookie": cookie
        }
    });

    // 监听连接成功事件
    socket.addEventListener('open', () => {
        console.log('WebSocket 连接已建立');
    });

    // 监听消息事件
    socket.addEventListener('message', (event) => {
        console.log('收到消息:', event.data);
    });

    // 监听连接关闭事件
    socket.addEventListener('close', () => {
        console.log('WebSocket 连接已关闭');
        restart(cookie)
    });

    // 监听错误事件
    socket.addEventListener('error', (error) => {
        console.error('WebSocket 发生错误:', error);
    });
}

