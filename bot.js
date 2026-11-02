const bedrock = require('bedrock-protocol');
const express = require('express');

// Express server giữ cho tiến trình cloud luôn sống
const app = express();
app.get('/', (req, res) => res.send('Bot AFK Bedrock Aternos đang chạy!'));
app.listen(process.env.PORT || 3000);

// Cấu hình Server Aternos của bạn
const CONFIG = {
    HOST: 'Heopeppa.aternos.me',
    PORT: 19132,
    BASE_NAME: 'AFK_Bot',
    RECONNECT_DELAY: 10000 // Chờ 10 giây trước khi bot mới vào thế chỗ
};

let botIndex = 1;

function createBedrockBot(username) {
    console.log(`[+] Đang gửi bot Bedrock: ${username} vào ${CONFIG.HOST}:${CONFIG.PORT}...`);

    const client = bedrock.createClient({
        host: CONFIG.HOST,
        port: CONFIG.PORT,
        username: username,
        offline: true
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
        console.log(`[-] ${username} bị ngắt kết nối (${packet.reason || 'Không rõ lý do'}).`);
        triggerReconnect();
    });

    client.on('error', (err) => {
        console.log(`[!] Lỗi connection (${username}):`, err.message);
    });

    return client;
}

function triggerReconnect() {
    botIndex++;
    const nextUsername = `${CONFIG.BASE_NAME}_${botIndex}`;
    console.log(`[🔄] Chuẩn bị gửi bot mới (${nextUsername}) sau ${CONFIG.RECONNECT_DELAY / 1000} giây...`);

    setTimeout(() => {
        startBot();
    }, CONFIG.RECONNECT_DELAY);
}

function startBot() {
    const currentUsername = `${CONFIG.BASE_NAME}_${botIndex}`;
    createBedrockBot(currentUsername);
}

// Khởi chạy tiến trình
startBot();
                                                                  
