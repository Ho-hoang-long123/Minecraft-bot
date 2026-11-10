const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

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

// Nếu bạn nhập UUID từ Zalith Launcher vào GitHub Actions thì gán vào đây
const inputUuid = process.env.PLAYER_UUID ? process.env.PLAYER_UUID.trim() : '';
if (inputUuid !== '') {
    CONFIG.uuid = inputUuid;
}

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} (Phiên bản: ${CONFIG.version}) với tên: ${CONFIG.username}`);
    if (CONFIG.uuid) {
        console.log(`[*] Sử dụng UUID riêng từ Zalith Launcher: ${CONFIG.uuid}`);
    }

    const bot = mineflayer.createBot(CONFIG);
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ AN TOÀN!`);
        
        const mcData = require('minecraft-data')(bot.version);
        const defaultMove = new Movements(bot, mcData);
        bot.pathfinder.setMovements(defaultMove);

        // Chống AFK tự nhiên (quay đầu, nhìn ngẫu nhiên, nhảy)
        const antiAfkInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            if (bot.pathfinder.isMoving()) return;

            const randomYaw = Math.random() * Math.PI * 2;
            const randomPitch = (Math.random() * 0.5) - 0.25;

            bot.look(randomYaw, randomPitch, true, () => {
                if (Math.random() > 0.6) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 400);
                }
            });
        }, 20000);

        // Chạy trốn khi có quái vật hoặc người chơi tấn công trong bán kính 6 block
        const defenseInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            const filter = e => (e.type === 'mob' || e.type === 'player') && e.username !== bot.username && bot.entity.position.distanceTo(e.position) < 6;
            const danger = bot.nearestEntity(filter);

            if (danger) {
                console.log(`[!] Phát hiện nguy hiểm từ ${danger.username || danger.name}! Đang chạy trốn...`);
                const dx = bot.entity.position.x - danger.position.x;
                const dz = bot.entity.position.z - danger.position.z;
                
                const escapeGoal = new goals.GoalBlock(
                    Math.floor(bot.entity.position.x + dx * 3),
                    Math.floor(bot.entity.position.y),
                    Math.floor(bot.entity.position.z + dz * 3)
                );
                
                bot.pathfinder.setGoal(escapeGoal, true);
            }
        }, 3000);

        bot.once('end', () => {
            clearInterval(antiAfkInterval);
            clearInterval(defenseInterval);
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
