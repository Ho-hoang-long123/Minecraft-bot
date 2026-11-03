const mineflayer = require('mineflayer');

// Bắt toàn bộ lỗi ngầm, không cho bot crash thoát tiến trình
process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm được xử lý:', err.message);
});

const CONFIG = {
    host: process.env.SERVER_HOST || 'Heopeppa.aternos.me',
    port: parseInt(process.env.SERVER_PORT || '25565'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    // Ép nhận diện phiên bản Purpur build 26.3 và tắt kiểm tra ngặt nghèo
    version: '26.3',
    checkVersionCompatibility: false
};

function createBot() {
    console.log(`[+] Đang kết nối tới Server ${CONFIG.host}:${CONFIG.port} (Phiên bản: ${CONFIG.version}) với tên ${CONFIG.username}...`);
    
    let bot;
    try {
        bot = mineflayer.createBot(CONFIG);
    } catch (err) {
        console.log(`[!] Lỗi khởi tạo bot: ${err.message}. Thử lại sau 15s...`);
        setTimeout(createBot, 15000);
        return;
    }

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER THÀNH CÔNG!`);
        
        // Nhảy mỗi 30 giây để giữ kết nối AFK chống đá ra khỏi server
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
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

createBot();
