const mineflayer = require('mineflayer');

// Chặn crash hệ thống GitHub Actions
process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

const CONFIG = {
    host: process.env.SERVER_HOST || 'Heopeppa.aternos.me',
    port: parseInt(process.env.SERVER_PORT || '25565'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    version: false // Tự động dò phiên bản Java của server
};

function createBot() {
    console.log(`[+] Đang kết nối tới Java Server ${CONFIG.host}:${CONFIG.port} với tên ${CONFIG.username}...`);
    
    const bot = mineflayer.createBot(CONFIG);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} đã vào server Java thành công!`);
        
        // Cứ mỗi 30 giây nhảy một lần để không bị kick lỗi AFK
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
