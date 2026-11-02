const bedrock = require('bedrock-protocol');
const express = require('express');

// Bắt toàn bộ lỗi ngầm để tránh crash tiến trình làm dừng GitHub Actions (Exit Code 1)
process.on('uncaughtException', (err) => {
    console.log('[!] Đã chặn crash hệ thống:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('[!] Bỏ qua Promise lỗi ngầm:', reason);
});

// Express server giữ tiến trình ngầm luôn chạy
const app = express();
app.get('/', (req, res) => res.send('Bot AFK Bedrock đang hoạt động!'));
app.listen(process.env.PORT || 3000);

const CONFIG = {
    HOST: 'Heopeppa.aternos.me',
    PORT: 19132,
    BASE_NAME: 'AFK_Bot',
    RECONNECT_DELAY: 15000 // Chờ 15 giây để gửi lại
};

let botIndex = 1;

function createBedrockBot(username) {
    console.log(`[+] Đang thử kết nối bot: ${username} tới ${CONFIG.HOST}:${CONFIG.PORT}...`);

    try {
        const client = bedrock.createClient({
            host: CONFIG.HOST,
            port: CONFIG.PORT,
            username: username,
            offline: true,
            connectTimeout: 20000
        });

        client.on('join', () => {
            console.log(`[✓] Bot Bedrock ${username} đã vào server thành công!`);
        });

        client.on('text', (packet) => {
            if (packet.message) {
                console.log(`[Chat] ${packet.source_name || 'System'}: ${packet.message}`);
            }
        });

        client.on('disconnect', (packet) => {
            console.log(`[-] ${username} bị ngắt kết nối (${packet.reason || 'Server ngắt'}).`);
            triggerReconnect();
        });

        client.on('error', (err) => {
            console.log(`[!] Lỗi kết nối (${username}):`, err.message);
            triggerReconnect();
        });

    } catch (err) {
        console.log(`[!] Không thể khởi tạo bot (${username}):`, err.message);
        triggerReconnect();
    }
}

function triggerReconnect() {
    botIndex++;
    const nextUsername = `${CONFIG.BASE_NAME}_${botIndex}`;
    console.log(`[🔄] Đang chờ ${CONFIG.RECONNECT_DELAY / 1000} giây trước khi gửi lại (${nextUsername})...`);

    setTimeout(() => {
        startBot();
    }, CONFIG.RECONNECT_DELAY);
}

function startBot() {
    const currentUsername = `${CONFIG.BASE_NAME}_${botIndex}`;
    createBedrockBot(currentUsername);
}

// Bắt đầu chạy bot
startBot();
