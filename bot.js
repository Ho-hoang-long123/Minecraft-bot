const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

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
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(`[✓] Bot ${CONFIG.username} ĐÃ VÀO SERVER VÀ AN TOÀN!`);
        
        const mcData = require('minecraft-data')(bot.version);
        const defaultMove = new Movements(bot, mcData);
        bot.pathfinder.setMovements(defaultMove);

        // 1. Chống AFK tự nhiên (quay đầu, nhìn ngẫu nhiên, nhảy)
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

        // 2. Chạy trốn khi có quái vật hoặc người chơi tấn công trong bán kính 6 block
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

        // 3. TÍNH NĂNG MỚI: Tự động tìm hang / khu vực tối hoặc thấp hơn để chui xuống trú ẩn định kỳ
        const caveSeekInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            // Nếu bot đang di chuyển né quái hoặc đang bận việc khác thì bỏ qua
            if (bot.pathfinder.isMoving()) return;

            console.log(`[*] Đang tìm kiếm hang động hoặc khu vực thấp/trú ẩn xung quanh...`);

            // Quét các block xung quanh trong bán kính 10 block để tìm lối đi xuống hoặc hang (block không khí ở độ cao thấp hơn hoặc có mái che)
            const p = bot.entity.position;
            let bestTarget = null;
            let lowestY = p.y;

            for (let x = -10; x <= 10; x += 2) {
                for (let z = -10; z <= 10; z += 2) {
                    for (let y = -4; y <= 2; y++) {
                        const checkPos = p.offset(x, y, z);
                        const block = bot.blockAt(checkPos);
                        const blockAbove = bot.blockAt(checkPos.offset(0, 1, 0));
                        const blockBelow = bot.blockAt(checkPos.offset(0, -1, 0));

                        // Điều kiện nhận diện hang/hầm: Là chỗ trống (air), bên dưới là khối rắn (để đứng), và có vật cản ở trên đầu (có mái che/hang)
                        if (block && block.name === 'air' && blockBelow && blockBelow.name !== 'air' && blockAbove && blockAbove.name !== 'air') {
                            if (checkPos.y < lowestY) {
                                lowestY = checkPos.y;
                                bestTarget = checkPos;
                            }
                        }
                    }
                }
            }

            if (bestTarget) {
                console.log(`[✓] Đã tìm thấy vị trí hang/hầm tại (${Math.floor(bestTarget.x)}, ${Math.floor(bestTarget.y)}, ${Math.floor(bestTarget.z)}). Đang di chuyển vào trong...`);
                const goal = new goals.GoalBlock(bestTarget.x, bestTarget.y, bestTarget.z);
                bot.pathfinder.setGoal(goal);
            } else {
                // Nếu không tìm thấy hang tự nhiên gần đó, bot sẽ tự động đi di chuyển ngẫu nhiên một quãng ngắn để tìm
                const randomX = p.x + (Math.random() * 16 - 8);
                const randomZ = p.z + (Math.random() * 16 - 8);
                const groundBlock = bot.findBlock({
                    matching: block => block.name !== 'air',
                    maxDistance: 10
                });
                if (groundBlock) {
                    bot.pathfinder.setGoal(new goals.GoalBlock(randomX, groundBlock.position.y + 1, randomZ));
                }
            }
        }, 120000); // Cứ mỗi 2 phút bot sẽ tự động quét và tìm chỗ chui xuống hang/trú ẩn một lần

        bot.once('end', () => {
            clearInterval(antiAfkInterval);
            clearInterval(defenseInterval);
            clearInterval(caveSeekInterval);
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
