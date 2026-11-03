const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

const CONFIG = {
    host: process.env.SERVER_HOST || 'Heopeppa.aternos.me',
    port: parseInt(process.env.SERVER_PORT || '25565'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    // QUAN TRỌNG: Để false để bot tự động dò theo server Purpur 26.3
    version: false 
};

function createBot() {
    console.log(`[+] Đang kết nối tới Purpur Server ${CONFIG.host}:${CONFIG.port} với tên ${CONFIG.username}...`);
    
    const bot = mineflayer.createBot(CONFIG);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} đã vào server thành công!`);
        
        // Nhảy mỗi 30 giây chống AFK
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 30000);
    });

    bot.on('end', (reason) => {
        console.log(`[-] Bị ngắt kết nối: ${reason}. Đang kết nối lại sau 15 giây...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

createBot();
