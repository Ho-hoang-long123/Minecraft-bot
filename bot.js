const mineflayer = require('mineflayer');

// Xác định tên: Nếu có nhập PLAYER_NAME thì dùng, nếu không sẽ tự tạo ngẫu nhiên
const inputUsername = process.env.PLAYER_NAME;
const finalUsername = (inputUsername && inputUsername.trim() !== '') 
    ? inputUsername.trim() 
    : 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100);

const CONFIG = {
    host: process.env.SERVER_HOST || 'leaffish.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '11391'),
    username: finalUsername,
    version: process.env.SERVER_VERSION || '1.21', 
    auth: 'offline',
    checkVersionCompatibility: false,
    defaultTimeout: 60000
};

// Nếu có nhập UUID, thêm vào config của bot
const inputUuid = process.env.PLAYER_UUID;
if (inputUuid && inputUuid.trim() !== '') {
    CONFIG.uuid = inputUuid.trim();
}

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} (Phiên bản: ${CONFIG.version}) với tên ${CONFIG.username}...`);

    const bot = mineflayer.createBot(CONFIG);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ AN TOÀN! (Chế độ đứng yên 100%)`);

        // Chống AFK nhẹ nhàng: Chỉ quay đầu thay đổi góc nhìn tại chỗ (không di chuyển, không nhảy)
        const antiAfkInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            const randomYaw = Math.random() * Math.PI * 2;
            const randomPitch = (Math.random() * 0.4) - 0.2; // Nhìn lên xuống nhẹ

            bot.look(randomYaw, randomPitch, true);
        }, 20000);

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
