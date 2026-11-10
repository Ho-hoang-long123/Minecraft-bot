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

let isConnected = false; // Cờ kiểm tra xem bot đã vào game chưa

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} (Phiên bản: ${CONFIG.version}) với tên: ${CONFIG.username}...`);

    const bot = mineflayer.createBot(CONFIG);

    // Ép bật vật lý chuẩn để tránh lỗi lơ lửng khi spawn
    bot.physicsEnabled = true;

    bot.on('spawn', () => {
        isConnected = true;
        console.log(`[✓] BOT ${CONFIG.username} ĐÃ VÀO GAME THÀNH CÔNG! ĐANG TREO AFK LIÊN TỤC...`);

        // Đợi 1s để ổn định vị trí chân chạm đất
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.clearControlStates();
            }
        }, 1000);

        // Chống AFK an toàn: Chỉ xoay góc nhìn ngẫu nhiên mỗi 30s để server nhận biết bot hoạt động
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

    // Tự động gõ lệnh Login/Register nếu server dùng AuthMe
    bot.on('message', (jsonMsg) => {
        const message = jsonMsg.toString();
        if (message.includes('/login') || message.includes('/register')) {
            console.log('[!] Server yêu cầu đăng nhập/đăng ký. Đang gửi lệnh...');
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
        isConnected = false;
        console.log(`[!] Mất kết nối (Lý do: ${reason}). Đang thử kết nối lại sau 10 giây...`);
        
        // Thử vào lại liên tục mỗi 10 giây nếu bị out
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối: ${err.message}`);
    });
}

// Bắt đầu chạy bot
createBot();
