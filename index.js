const WebSocket = require('ws');
const axios = require('axios'); // 引入 axios 用于发送 HTTP 请求

// 从环境变量中获取 COOKIE
const cookie = process.env.COOKIE;
// 从环境变量中获取 BARK_URL
const barkUrl = process.env.BARK_URL;
// 从环境变量中获取最大重连次数，默认为 5
const MAX_RECONNECT_ATTEMPTS = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '5', 10);

let reconnectAttempts = 0; // 重连尝试次数计数器
let barkMessageSent = false; // 标志位，确保 Bark 消息只发送一次

const TIME = 1000 * parseInt(process.env.TIME || '3', 10);

// 检查 COOKIE 是否存在
if (cookie) {
  start(cookie);
} else {
  console.error('COOKIE 环境变量未设置');
}

async function restart(cookie) {
    console.log('restart', TIME);
    await new Promise(resolve => setTimeout(resolve, TIME));
    start(cookie);
}

async function sendBarkMessage(title, body) {
    if (!barkUrl) {
        console.warn('BARK_URL 环境变量未设置，无法发送 Bark 消息。');
        return;
    }
    try {
        await axios.get(`${barkUrl}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`);
        console.log('Bark 消息发送成功！');
    } catch (error) {
        console.error('发送 Bark 消息失败:', error.message);
    }
}

function start(cookie) {
    console.log('start', cookie);
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
        console.log('收到消息:', reconnectAttempts, event.data);
        reconnectAttempts = 0; // 连接成功时重置计数器
        barkMessageSent = false; // 连接成功时重置 Bark 消息发送标志
    });

    // 监听连接关闭事件
    socket.addEventListener('close', () => {
        console.log('WebSocket 连接已关闭', reconnectAttempts, MAX_RECONNECT_ATTEMPTS);
        reconnectAttempts++;
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && !barkMessageSent) {
            sendBarkMessage('WebSocket 连接异常', `WebSocket 连接已关闭，重连尝试次数达到 ${MAX_RECONNECT_ATTEMPTS} 次。`);
            barkMessageSent = true; // 设置标志，表示已发送 Bark 消息
        }
        restart(cookie);
    });

    // 监听错误事件
    socket.addEventListener('error', (error) => {
        console.error('WebSocket 发生错误:', error);
        reconnectAttempts++;
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && !barkMessageSent) {
            sendBarkMessage('WebSocket 错误', `WebSocket 发生错误，重连尝试次数达到 ${MAX_RECONNECT_ATTEMPTS} 次。错误信息: ${error.message}`);
            barkMessageSent = true; // 设置标志，表示已发送 Bark 消息
        }
    });
}
