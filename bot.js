const mineflayer = require('mineflayer');

const CONFIG = {
    host: process.env.SERVER_HOST || 'hawkfish.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '11391'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    version: process.env.SERVER_VERSION || '1.21',
    auth: 'offline',
    checkVersionCompatibility: false,
    defaultTimeout: 60000 // Tăng thời gian chờ timeout lên 60s
};

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} với tên ${CONFIG.username}...`);

    const bot = mineflayer.createBot(CONFIG);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ HOẠT ĐỘNG ỔN ĐỊNH!`);
        
        // Cơ chế chống AFK tự nhiên (Thay vì chỉ nhảy, bot sẽ quay đầu và nhìn ngẫu nhiên giống người thật)
        const antiAfkInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            // Chọn ngẫu nhiên góc quay đầu (yaw và pitch)
            const randomYaw = Math.random() * Math.PI * 2;
            const randomPitch = (Math.random() * 0.5) - 0.25; // Nhìn lên xuống nhẹ nhàng

            bot.look(randomYaw, randomPitch, true, () => {
                // Thỉnh thoảng nhún nhảy nhẹ ngẫu nhiên
                if (Math.random() > 0.5) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 400);
                }
            });
        }, 20000); // Thực hiện mỗi 20 giây

        // Dọn dẹp interval khi bot ngắt kết nối để tránh lỗi tràn bộ nhớ
        bot.once('end', () => {
            clearInterval(antiAfkInterval);
        });
    });

    // Bắt lỗi cụ thể nếu bị server đá ra
    bot.on('kicked', (reason) => {
        console.log(`[!] BỊ SERVER KICK! Lý do chi tiết:`, JSON.stringify(reason));
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] <${username}> ${message}`);
    });

    // Tự động kết nối lại ngay lập tức khi mất kết nối
    bot.on('end', (reason) => {
        console.log(`[!] Ngắt kết nối (Lý do: ${reason}). Đang kết nối lại sau 10 giây...`);
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

createBot();
