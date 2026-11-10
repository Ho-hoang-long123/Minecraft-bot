const mineflayer = require('mineflayer');

// Xử lý tên: Ưu tiên lấy từ GitHub Actions, nếu trống tự sinh tên ngẫu nhiên
const inputName = process.env.PLAYER_NAME ? process.env.PLAYER_NAME.trim() : '';
const finalUsername = inputName !== '' ? inputName : 'AFK_Bot_' + Math.floor(Math.random() * 9000 + 1000);

const CONFIG = {
    host: process.env.SERVER_HOST || 'leaffish.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '11391'),
    username: finalUsername,
    version: process.env.SERVER_VERSION || '1.21.11', 
    auth: 'offline',
    checkVersionCompatibility: false,
    defaultTimeout: 60000
};

// Gán UUID nếu người dùng nhập từ Zalith Launcher
const inputUuid = process.env.PLAYER_UUID ? process.env.PLAYER_UUID.trim() : '';
if (inputUuid !== '') {
    CONFIG.uuid = inputUuid;
}

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} (Phiên bản: ${CONFIG.version}) với tên: ${CONFIG.username}`);
    if (CONFIG.uuid) {
        console.log(`[*] Sử dụng UUID riêng: ${CONFIG.uuid}`);
    }

    const bot = mineflayer.createBot(CONFIG);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ AN TOÀN!`);

        // Cơ chế chống AFK an toàn 100%: Quay đầu + Cúi người (Sneak) nhẹ mỗi 25s
        // Không dùng jump hay pathfinder di chuyển để tránh bị server phát hiện invalid movement
        const antiAfkInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            const randomYaw = Math.random() * Math.PI * 2;
            const randomPitch = (Math.random() * 0.4) - 0.2;

            // 1. Quay góc nhìn ngẫu nhiên
            bot.look(randomYaw, randomPitch, true, () => {
                // 2. Nhấp nhả Sneak (cúi người) an toàn
                bot.setControlState('sneak', true);
                setTimeout(() => {
                    if (bot) bot.setControlState('sneak', false);
                }, 500);
            });
        }, 25000);

        bot.once('end', () => {
            clearInterval(antiAfkInterval);
        });
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] BỊ SERVER KICK! Lý do:`, JSON.stringify(reason));
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] <${username}> ${message}`);
    });

    bot.on('end', (reason) => {
        console.log(`[!] Ngắt kết nối (Lý do: ${reason}). Đang kết nối lại sau 10s...`);
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

createBot();
