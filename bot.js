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

let reconnectAttempts = 0;

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} (v${CONFIG.version}) với tên: ${CONFIG.username}...`);

    const bot = mineflayer.createBot(CONFIG);

    // Chặn lỗi phát sinh từ luồng mạng để bot không bị crash ứng dụng node.js
    bot.on('error', (err) => {
        console.log(`[!] Lỗi kết nối mạng: ${err.message}`);
    });

    bot.on('spawn', () => {
        reconnectAttempts = 0; // Reset lại bộ đếm khi đã vào thành công
        console.log(`[✓] BOT ${CONFIG.username} ĐÃ VÀO GAME THÀNH CÔNG VÀ AN TOÀN!`);

        // QUAN TRỌNG: Chờ 2 giây để server Aternos load xong chunk và vị trí dưới chân bot,
        // tuyệt đối không gửi bất kỳ packet di chuyển/quay đầu nào ngay lúc mới spawn để tránh lỗi invalid_player_movement.
        setTimeout(() => {
            if (!bot || !bot.entity) return;
            
            bot.clearControlStates();
            bot.physicsEnabled = true;

            // Sau khi đã đứng vững hoàn toàn, mới bật bộ đếm chống AFK an toàn (chỉ quay đầu nhẹ)
            const antiAfkInterval = setInterval(() => {
                if (!bot || !bot.entity) return;

                const randomYaw = Math.random() * Math.PI * 2;
                const randomPitch = (Math.random() * 0.3) - 0.15;

                try {
                    bot.look(randomYaw, randomPitch, true);
                } catch (e) {
                    // Bỏ qua lỗi nhỏ nếu entity chưa sẵn sàng
                }
            }, 30000); // 30 giây quay đầu 1 lần

            bot.once('end', () => {
                clearInterval(antiAfkInterval);
            });
        }, 2000);
    });

    // Tự động đăng nhập nếu server dùng AuthMe
    bot.on('message', (jsonMsg) => {
        const message = jsonMsg.toString();
        if (message.includes('/login') || message.includes('/register')) {
            console.log('[!] Phát hiện yêu cầu đăng nhập từ server. Đang gửi lệnh...');
            bot.chat('/login 12345678');
            bot.chat('/register 12345678 12345678');
        }
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] BỊ SERVER KICK! Lý do chi tiết:`, JSON.stringify(reason));
    });

    bot.on('end', (reason) => {
        reconnectAttempts++;
        console.log(`[!] Mất kết nối (Lý do: ${reason}). Đang thử kết nối lại sau 10 giây (Lần thử: ${reconnectAttempts})...`);
        
        // Thử lại sau đúng 10 giây
        setTimeout(createBot, 10000);
    });
}

createBot();
