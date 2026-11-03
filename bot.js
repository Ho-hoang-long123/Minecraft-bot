const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

const CONFIG = {
    host: process.env.SERVER_HOST || 'drum.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '60653'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    version: process.env.SERVER_VERSION || '1.21',
    auth: 'offline',               // Bắt buộc cho server Aternos tắt online-mode
    keepAlive: true,              // Giữ kết nối socket liên tục
    checkVersionCompatibility: false
};

function createBot() {
    console.log(`[+] Đang kết nối tới Server ${CONFIG.host}:${CONFIG.port} (Bản: ${CONFIG.version}) với tên ${CONFIG.username}...`);
    
    let bot;
    try {
        bot = mineflayer.createBot(CONFIG);
    } catch (err) {
        console.log(`[!] Lỗi khởi tạo: ${err.message}. Thử lại sau 15s...`);
        setTimeout(createBot, 15000);
        return;
    }

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER THÀNH CÔNG!`);
        
        // Nhảy mỗi 30 giây để chống AFK kick
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => {
                    if (bot) bot.setControlState('jump', false);
                }, 500);
            }
        }, 30000);
    });

    bot.on('end', (reason) => {
        console.log(`[-] Bị ngắt kết nối: ${reason}. Đang thử kết nối lại sau 15 giây...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi socket/kết nối: ${err.message}`);
    });
}

createBot();
