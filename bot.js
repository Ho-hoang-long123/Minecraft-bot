const mineflayer = require('mineflayer');

// Lấy thông tin từ biến môi trường của GitHub Actions hoặc file .env
const CONFIG = {
    host: process.env.SERVER_HOST || 'hawkfish.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '11391'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    version: process.env.SERVER_VERSION || '1.21',
    auth: 'offline',
    checkVersionCompatibility: false
};

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} với tên ${CONFIG.username}...`);

    const bot = mineflayer.createBot(CONFIG);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER THÀNH CÔNG!`);
        
        // Nhảy nhẹ mỗi 30s để chống bị đá ra vì AFK
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 30000);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] <${username}> ${message}`);
    });

    // Xử lý khi bị ngắt kết nối
    bot.on('end', (reason) => {
        console.log(`[!] Bot bị ngắt kết nối (Lý do: ${reason}). Đang kết nối lại sau 15s...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi Bot: ${err.message}`);
    });
}

createBot();
