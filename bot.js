const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

function createBot() {
    const bot = mineflayer.createBot({
        host: process.env.SERVER_HOST || 'drum.aternos.host',
        port: parseInt(process.env.SERVER_PORT || '60653'), // Dùng port Java của Aternos
        username: 'nhinmegi_' + Math.floor(Math.random() * 900 + 100),
        auth: 'offline' // Bắt buộc cho server Cracked
    });

    bot.on('spawn', () => {
        console.log(`[✓] Bot Java ${bot.username} ĐÃ VÀO SERVER THÀNH CÔNG!`);
    });

    bot.on('end', (reason) => {
        console.log(`[-] Bị ngắt kết nối do: ${reason}. Đang tự động kết nối lại sau 15 giây...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

createBot();
