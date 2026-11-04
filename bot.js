const mineflayer = require('mineflayer');

const CONFIG = {
    host: process.env.SERVER_HOST || 'hawkfish.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '11391'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    version: process.env.SERVER_VERSION || '1.21',
    auth: 'offline',
    checkVersionCompatibility: false,
    // Tăng thời gian chờ (timeout) lên 60 giây để chống rớt mạng giữa chừng trên GitHub
    defaultTimeout: 60000 
};

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} với tên ${CONFIG.username}...`);

    const bot = mineflayer.createBot(CONFIG);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ HOẠT ĐỘNG!`);
        
        // Nhảy nhẹ mỗi 30s chống kick AFK
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 30000);
    });

    // Bắt sự kiện khi bot bị server đá ra (Kick) để xem nguyên nhân
    bot.on('kicked', (reason) => {
        console.log(`[!] BỊ SERVER KICK! Lý do:`, JSON.stringify(reason));
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] <${username}> ${message}`);

        // [TÙY CHỌN] Nếu server có AuthMe và yêu cầu đăng nhập, bot sẽ tự động gõ lệnh đăng nhập ở đây
        // if (message.includes('register')) {
        //     bot.chat('/register MatKhauCuaBan MatKhauCuaBan');
        // }
        // if (message.includes('login')) {
        //     bot.chat('/login MatKhauCuaBan');
        // }
    });

    bot.on('end', (reason) => {
        console.log(`[!] Ngắt kết nối (Lý do: ${reason}). Đang vào lại sau 15s...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

createBot();
