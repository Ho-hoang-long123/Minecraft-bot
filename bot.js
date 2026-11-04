const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const CONFIG = {
    host: process.env.SERVER_HOST || 'firefish.aternos.host',
    port: parseInt(process.env.SERVER_PORT || '11391'),
    username: 'AFK_Bot_' + Math.floor(Math.random() * 900 + 100),
    // Ép phiên bản về 1.21 hoặc 1.21.4 để Mineflayer không bị crash
    version: '1.21.4', 
    auth: 'offline',
    // QUAN TRỌNG: Bật cờ này để cho phép bot vào server có phiên bản mới hơn thư viện
    checkVersionCompatibility: false,
    defaultTimeout: 60000
};

function createBot() {
    console.log(`[+] Đang kết nối tới ${CONFIG.host}:${CONFIG.port} với tên ${CONFIG.username}...`);

    const bot = mineflayer.createBot(CONFIG);
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ AN TOÀN!`);
        
        const mcData = require('minecraft-data')(bot.version);
        const defaultMove = new Movements(bot, mcData);
        bot.pathfinder.setMovements(defaultMove);

        // Chống AFK tự nhiên (quay đầu, nhìn ngẫu nhiên)
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
