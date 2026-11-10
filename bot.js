const mineflayer = require('mineflayer');

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

// Nếu có nhập UUID riêng
const inputUuid = process.env.PLAYER_UUID ? process.env.PLAYER_UUID.trim() : '';
if (inputUuid !== '') {
    CONFIG.uuid = inputUuid;
}

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} (Phiên bản: ${CONFIG.version}) với tên: ${CONFIG.username}`);

    const bot = mineflayer.createBot(CONFIG);

    // Ép bật tính năng vật lý chuẩn ngay từ đầu
    bot.physicsEnabled = true;

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ AN TOÀN!`);

        // Đợi 1 giây để server ổn định vị trí chân chạm đất
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.clearControlStates(); // Xóa sạch các phím đang nhấn dở
            }
        }, 1000);

        // Anti-AFK an toàn: Chỉ xoay góc nhìn ngẫu nhiên mỗi 30s
        const antiAfkInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            const randomYaw = Math.random() * Math.PI * 2;
            const randomPitch = (Math.random() * 0.4) - 0.2;

            bot.look(randomYaw, randomPitch, true);
        }, 30000);

        bot.once('end', () => {
            clearInterval(antiAfkInterval);
        });
    });

    // Tự động nhận biết câu lệnh Login/Register nếu server dùng AuthMe
    bot.on('message', (jsonMsg) => {
        const message = jsonMsg.toString();
        if (message.includes('/login') || message.includes('/register')) {
            console.log('[!] Server yêu cầu đăng nhập/đăng ký. Đang gửi mật khẩu tạm...');
            bot.chat('/login 12345678');
            bot.chat('/register 12345678 12345678');
        }
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] BỊ SERVER KICK! Lý do:`, JSON.stringify(reason));
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] <${username}> ${message}`);
    });

    bot.on('end', (reason) => {
        console.log(`[!] Ngắt kết nối (Lý do: ${reason}). Đang kết nối lại sau 45s để tránh cooldown...`);
        setTimeout(createBot, 45000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

createBot();
