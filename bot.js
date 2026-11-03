const mineflayer = require('mineflayer');

process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

function createBot() {
    const username = 'nhinmegi_' + Math.floor(Math.random() * 900 + 100);
    const host = process.env.SERVER_HOST || 'drum.aternos.host';
    const port = parseInt(process.env.SERVER_PORT || '60653');

    console.log(`[+] Đang kết nối Java tới ${host}:${port} với tên ${username}...`);

    const bot = mineflayer.createBot({
        host: host,
        port: port,
        username: username,
        auth: 'offline', // Bắt buộc cho server Cracked
        version: false   // TỰ ĐỘNG nhận diện phiên bản server (Paper/Fabric/Purpur mới nhất)
    });

    bot.on('spawn', () => {
        console.log(`[✓] KHỦNG KHIẾP CHƯA! Bot Java ${bot.username} ĐÃ VÀO SERVER THÀNH CÔNG!`);
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
