const WebSocket = require('ws');
const axios = require('axios'); // 引入 axios 用于发送 HTTP 请求

// 从环境变量中获取 COOKIE
const cookie = process.env.COOKIE || `_ga=GA1.1.1012752762.1749952440; _ga_M7RS0DPPYZ=GS2.1.s1749952440$o1$g1$t1749952483$j17$l0$h0; connect.sid=s%3AGdugsASnVYSTW4HlGUvpoKPNAWKrEOK0.qpigHJ07bOejpr%2F5DiyFdvv2%2Fr4qW8Bys6Juffc0Yfg; cf_clearance=29Eye.ovLAgAWiM6ZXKYKf87SATj0uzhCS.995JFeZE-1750348123-1.2.1.1-IOSnzVgLrmU57HvWRoXHkhqVd8DKpJs9MNWDCjq1_bSzw3ll9wusj.UBkA33L3GE_Es4q5Jah4JSIk0mZ9VToHfrNk4_J6yFM3y5pMx5xfu2_pfNKaAx4zw0Wh9eh__lsKH5YQVjkOtJ0mHiaMsswEnJSX_UCcmhkpn5wNlEmH43QM5qHl5S76SkSeyemVvEQsHVGeubr6GGh7_ng36vSDqAAsCzMluaJ7JSxYBrTiaFG0hN60ccls0yiPsIMO7A2DiH2z5JLxbpFSvr3bsbQUJrKSWRBSOW4RBTba4P6p1JoYS.vWCrhmI8c0eiWlPxmu2ys774ZhXlm7CVKDxIcndYPDXHW2mcd9oyRGMfyp0H1As8Jdqz2O9DXRqFGwfl`;
// 从环境变量中获取 BARK_URL
const barkUrl = process.env.BARK_URL;
// 从环境变量中获取最大重连次数，默认为 5
const MAX_RECONNECT_ATTEMPTS = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '3', 10);

let reconnectAttempts = 0; // 重连尝试次数计数器
let barkMessageSent = false; // 标志位，确保 Bark 消息只发送一次
const HOST = 'my.sryzen.cloud'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0'

const TIME = 1000 * parseInt(process.env.TIME || '5', 10);

// 创建axios实例
const apiClient = axios.create({
    // 设置基础URL
    baseURL: 'https://my.sryzen.cloud',

    // 设置超时时间
    timeout: 10000,

    // 配置默认请求头
    headers: {
        "user-agent": UA,
        "cookie": cookie
    },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        // 例如添加认证token
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }
        //   console.log('请求配置:', config);
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        //   console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 检查 COOKIE 是否存在
if (cookie) {
    start(cookie);
    // startADS(cookie)
} else {
    console.error('COOKIE 环境变量未设置');
}

async function startADS(cookie) {
    try {
        let res = await apiClient({
            url: `/api/coins/ad-start`,
            method: 'POST',
            data: null,
        })
        let token = res.data.token;
        console.log('ad-start', token);
        res = await apiClient({
            url: `/api/coins/ad-view-start`,
            method: 'POST',
            data: { "token": token },
        })
        console.log('ad-view-start', res.data);
        await new Promise(resolve => setTimeout(resolve, 2000));
        res = await apiClient({
            url: `/api/coins/ad-verify`,
            method: 'POST',
            data: { "token": token },
        })
        console.log('ad-verify', res.data);
        res = await apiClient({
            url: `/api/coins/ad-reward`,
            method: 'POST',
            data: { "token": token },
        })
        console.log('ad-reward', res.data);
        restartADS(cookie)
    } catch (error) {
        console.error('ad-start error', error.message);
        restartADS(cookie)
    }
}

async function restartADS(cookie) {
    console.log('restartADS', TIME);
    await new Promise(resolve => setTimeout(resolve, TIME));
    startADS(cookie)
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
    try {
        // 使用 WebSocket 对象来建立 WebSocket 连接
        const socket = new WebSocket(`wss://${HOST}/ws`, {
            headers: {
                "user-agent": UA,
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
            console.error('WebSocket 发生错误:', error.message);
            reconnectAttempts++;
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && !barkMessageSent) {
                sendBarkMessage('WebSocket 错误', `WebSocket 发生错误，重连尝试次数达到 ${MAX_RECONNECT_ATTEMPTS} 次。错误信息: ${error.message}`);
                barkMessageSent = true; // 设置标志，表示已发送 Bark 消息
            }
        });
    } catch (error) {
        console.error('start WS', error.message);
        restart(cookie)
    }
}
