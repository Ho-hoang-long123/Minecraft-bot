const bedrock = require('bedrock-protocol');

process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

const CONFIG = {
    host: process.env.SERVER_HOST || 'drum.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '19132'), // Port Bedrock trên Aternos
    username: 'nhinmegi_' + Math.floor(Math.random() * 90 + 10), // Tên bot chính chủ của bạn
    offline: true // Bắt buộc cho server Cracked
};

function createBot() {
    console.log(`[+] Đang kết nối Bedrock tới ${CONFIG.host}:${CONFIG.port} với tên ${CONFIG.username}...`);

    let client;
    try {
        client = bedrock.createClient(CONFIG);
    } catch (err) {
        console.log(`[!] Lỗi khởi tạo: ${err.message}. Thử lại sau 15s...`);
        setTimeout(createBot, 15000);
        return;
    }

    client.on('join', () => {
        console.log(`[✓] Bot Bedrock ${CONFIG.username} ĐÃ VÀO SERVER THÀNH CÔNG!`);
    });

    client.on('end', (reason) => {
        console.log(`[-] Bị ngắt kết nối: ${reason}. Đang thử kết nối lại sau 15 giây...`);
        setTimeout(createBot, 15000);
    });

    client.on('error', (err) => {
        console.log(`[!] Lỗi socket/kết nối: ${err.message}`);
    });
}

createBot();
