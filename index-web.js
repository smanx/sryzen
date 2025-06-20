// ==UserScript==
// @name         login sryzen
// @namespace    http://tampermonkey.net/
// @version      2025-06-11
// @description  try to take over the world!
// @author       You
// @match        https://my.sryzen.cloud/*
// @match        https://discord.com/oauth2/authorize*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sryzen.cloud
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    console.log('start');
    // 从环境变量中获取 BARK_URL
    const barkUrl = 'https://api.day.app/P47nrEhGUKLVLPa6ZNzUsf';
    // 从环境变量中获取最大重连次数，默认为 5
    const MAX_RECONNECT_ATTEMPTS = parseInt('5', 10);

    let reconnectAttempts = 0; // 重连尝试次数计数器
    let barkMessageSent = false; // 标志位，确保 Bark 消息只发送一次
    // https://my.sryzen.cloud/auth/discord/callback?code=HrYXM5Cfw10vISLx7wJAl0VsVl0nz5&state=3e23c195-7e94-4a94-acd1-6b71a9d921e6
    const CHECK_INTERVAL = 3000;
    let discordNotificationSent = false; // Add this line
    const TIME = 1000 * parseInt('5', 10);

    // Execute regularly
    clearInterval(window.checkTime)
    window.checkTime = setInterval(() => {
        checkLoginStatus()
    }, CHECK_INTERVAL)
    setTimeout(() => {
        if (window.location.href.startsWith('https://my.sryzen.cloud/coins/daily') && !isCloudflare()) {
            startWS()
            startADS()
        }
    }, 10000);
    function isCloudflare() {
        let isCF= document.querySelector('*').innerText.includes('Cloudflare')
        if (!barkMessageSent && isCF) {
            sendBarkMessage('startADS', `isCloudflare`);
            barkMessageSent = true; // 设置标志，表示已发送 Bark 消息
        }
        return isCF
    }
    function checkLoginStatus() {
        if (isCloudflare()) {
            console.log('Cloudflare detected, skipping...');
            return
        }
        if (window.location.href.startsWith('https://discord.com/login')) {
            console.log('Discord re-login required...');
            if (!discordNotificationSent) { // Add this check
                fetch('https://netlify-smanx.netlify.app/edge/proxy/https://api.day.app/P47nrEhGUKLVLPa6ZNzUsf/sryzen-login-required/please-re-login-discord-manually');
                discordNotificationSent = true; // Set to true after sending
            }
        }
        if (window.location.href.startsWith('https://my.sryzen.cloud/dashboard')) {
            location.pathname = '/coins/daily'
        }
        if (window.location.href.startsWith('https://my.sryzen.cloud/coins/daily')) {
            window.checkTime2 = setTimeout(() => {
                let element = document.querySelector("#heliactyl > div > div > div.flex.pt-16.lg\\:pt-0 > div > main > div > div > div.grid.grid-cols-1.lg\\:grid-cols-3.gap-6 > div.lg\\:col-span-2.space-y-6 > div:nth-child(1) > div.p-6 > div > button")
                if (element) {
                    element.click()
                }
                element = document.querySelector("*")
                if (element) {
                    if (element.innerText.includes('Already Claimed Today')) {
                        // console.log('Already Claimed Today');
                        // location.pathname = '/coins/afk'
                    }
                }
            }, CHECK_INTERVAL - 1000)
        }
        if (window.location.href.startsWith('https://my.sryzen.cloud/auth/discord/callback')) {
            console.log('Discord login successful');
            let innerText = document.querySelector('*').innerText
            let includes = ['merge-sub',
                'Authentication failed. Try fully logging out and back in; if it still fails',
                'Invalid state parameter'
            ].some((item) => {
                return innerText.includes(item)
            })
            if (includes) {

                clearTimeout(window.checkTime2)
                window.checkTime2 = setTimeout(() => {
                    clearInterval(window.checkTime)
                    clearTimeout(window.checkTime2)
                    location.href = 'https://my.sryzen.cloud'
                }, CHECK_INTERVAL - 1000)

            }
        }
        if (window.location.pathname.startsWith('/coins/afk')) {
            return
            clearTimeout(window.checkTime2)
            window.checkTime2 = setTimeout(() => {
                let element = document.querySelector("*")
                if (element) {
                    if (!element.innerText.includes('Connected')) {
                        console.log('Connection failed, attempting to reconnect...');
                        clearInterval(window.checkTime)
                        clearTimeout(window.checkTime2)
                        location.reload()
                    }
                }
            }, CHECK_INTERVAL - 1000)
            let timeText = document.querySelector("#heliactyl > div > div > div.flex.pt-16.lg\\:pt-0 > div > main > div > div > div.grid.grid-cols-1.md\\:grid-cols-2.gap-4 > div:nth-child(2) > div:nth-child(2) > div")
            if (timeText) {
                let time = timeText.innerText
                if (time > '99:30:00') {
                    console.log('Time is over x minutes')
                    clearInterval(window.checkTime)
                    clearTimeout(window.checkTime2)
                    location.reload()
                }
            }
        }
        if (window.location.pathname.startsWith('/auth')) {
            console.log('Not logged in, attempting to log in...');
            document.querySelector("#heliactyl > div > div > div.w-full.max-w-md.space-y-6 > div.bg-\\[\\#202229\\].border.border-\\[\\#2e3337\\].rounded-lg.overflow-hidden > div.p-6.space-y-4 > button.w-full.relative.flex.items-center.transition.justify-center.h-11.bg-\\[\\#394047\\].hover\\:bg-\\[\\#394047\\]\\/50.text-white.rounded-md.border.border-white\\/5.active\\:scale-95").click()
        }
        if (window.location.pathname.startsWith('/oauth2/authorize')) {
            console.log('Attempting to authorize...');
            document.querySelector("#app-mount > div.appAsidePanelWrapper_a3002d > div.notAppAsidePanel_a3002d > div.app_a3002d > div > div > div > div > div.content__49fc1.oauth2ModalContent__647f0.thin_d125d2.scrollerBase_d125d2").scrollTop = 1000
            setTimeout(() => {
                document.querySelector("#app-mount > div.appAsidePanelWrapper_a3002d > div.notAppAsidePanel_a3002d > div.app_a3002d > div > div > div > div > div.flex__7c0ba.horizontalReverse__7c0ba.justifyStart_abf706.alignStretch_abf706.noWrap_abf706.footer__49fc1.footer__647f0.footerSeparator__49fc1 > div > div > button").click()
            }, 100);
        }
    }
    async function sendBarkMessage(title, body) {
        if (!barkUrl) {
            console.warn('BARK_URL 环境变量未设置，无法发送 Bark 消息。');
            return;
        }
        try {
            await fetch(`${barkUrl}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`);
            console.log('Bark 消息发送成功！');
        } catch (error) {
            console.error('发送 Bark 消息失败:', error.message);
        }
    }
    async function startADS(cookie) {
        try {
            // 设置请求头，包含cookie（根据实际需求调整）
            const headers = {
                'Content-Type': 'application/json',
                // 如果需要携带cookie，可以取消下面注释并调整
                // 'Cookie': cookie
            };

            // 步骤1: 开始广告
            let res = await fetch('/api/coins/ad-start', {
                method: 'POST',
                headers,
            });
            let data = await res.json();
            let token = data.token;
            console.log('ad-start', token);

            // 步骤2: 开始观看广告
            res = await fetch('/api/coins/ad-view-start', {
                method: 'POST',
                headers,
                body: JSON.stringify({ token })
            });
            data = await res.json();
            console.log('ad-view-start', data);

            // 模拟观看2秒
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 步骤3: 验证广告
            res = await fetch('/api/coins/ad-verify', {
                method: 'POST',
                headers,
                body: JSON.stringify({ token })
            });
            data = await res.json();
            console.log('ad-verify', data);

            // 步骤4: 获取奖励
            res = await fetch('/api/coins/ad-reward', {
                method: 'POST',
                headers,
                body: JSON.stringify({ token })
            });
            data = await res.json();
            console.log('ad-reward', data);
            reconnectAttempts = 0
            barkMessageSent = false
            // 重启广告流程
            restartADS(cookie);
        } catch (error) {
            console.error('ad-start error', error);
            let includes = [`"<!DOCTYPE "... is not valid JSON`,
                'JSON.parse: unexpected character at line 1 column 1 of the JSON data'
            ].some((item) => {
                return error.message.includes(item)
            })
            reconnectAttempts++;
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && !barkMessageSent) {
                sendBarkMessage('startADS 连接异常', `重连尝试次数达到 ${MAX_RECONNECT_ATTEMPTS} 次。`);
                barkMessageSent = true; // 设置标志，表示已发送 Bark 消息
            }
            if (includes) {
                location.reload()
            } else {
                // 出错后重启广告流程
                restartADS(cookie);
            }
        }
    }

    async function restartADS(cookie) {
        console.log('restartADS', TIME);
        await new Promise(resolve => setTimeout(resolve, TIME));
        startADS(cookie);
    }
    async function restartWS(cookie) {
        console.log('restartWS', TIME);
        await new Promise(resolve => setTimeout(resolve, TIME));
        startWS(cookie);
    }
    function startWS(cookie) {
        console.log('start', cookie);
        // 使用 WebSocket 对象来建立 WebSocket 连接
        const socket = new WebSocket(`wss://${location.host}/ws`);

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
        socket.addEventListener('close', (error) => {
            console.log('WebSocket 连接已关闭', reconnectAttempts, MAX_RECONNECT_ATTEMPTS, error.reason);
            reconnectAttempts++;
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && !barkMessageSent) {
                sendBarkMessage('WebSocket 连接异常', `WebSocket 连接已关闭，重连尝试次数达到 ${MAX_RECONNECT_ATTEMPTS} 次。`);
                barkMessageSent = true; // 设置标志，表示已发送 Bark 消息
            }
            restartWS(cookie);
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

})();
