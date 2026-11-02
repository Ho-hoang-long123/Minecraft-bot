const bedrock = require('bedrock-protocol');

// Chặn crash hệ thống để GitHub Actions không bị dừng đột ngột
process.on('uncaughtException', (err) => {
    console.log('[!] Đã chặn lỗi ngầm:', err.message);
});

const CONFIG = {
    HOST: 'boarfish.aternos.host',
    PORT: parseInt(process.env.SERVER_PORT || '19132'), // Nhận port động từ GitHub Actions
    BASE_NAME: 'AFK_Bot',
    RECONNECT_DELAY: 15000
};

let botIndex = 1;

function startBot() {
    const username = `${CONFIG.BASE_NAME}_${botIndex}`;
    console.log(`[+] Đang kết nối tới DynIP ${CONFIG.HOST}:${CONFIG.PORT} với tên ${username}...`);

    try {
        const client = bedrock.createClient({
            host: CONFIG.HOST,
            port: CONFIG.PORT,
            username: username,
            offline: true,
            connectTimeout: 20000
        });

        client.on('join', () => {
            console.log(`[✓] Bot ${username} đã vào server thành công qua DynIP!`);
        });

        client.on('disconnect', (packet) => {
            console.log(`[-] Bị ngắt kết nối: ${packet.reason || 'Mất kết nối'}`);
            triggerReconnect();
        });

        client.on('error', (err) => {
            console.log(`[!] Lỗi kết nối: ${err.message}`);
            triggerReconnect();
        });

    } catch (err) {
        console.log(`[!] Không thể khởi tạo client: ${err.message}`);
        triggerReconnect();
    }
}

function triggerReconnect() {
    botIndex++;
    console.log(`[🔄] Đang chờ 15 giây để gửi bot mới (AFK_Bot_${botIndex})...`);
    setTimeout(startBot, CONFIG.RECONNECT_DELAY);
}

startBot();
