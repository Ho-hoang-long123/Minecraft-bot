const bedrock = require('bedrock-protocol');
const dns = require('dns');

process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

const rawHost = process.env.SERVER_HOST || 'beardfish.aternos.host';
const port = parseInt(process.env.SERVER_PORT || '19132');
const username = 'nhinmegi_' + Math.floor(Math.random() * 90 + 10);

function startBot(targetIp) {
    console.log(`[+] Đang tạo kết nối Bedrock UDP tới ${targetIp}:${port} (Bot: ${username})...`);

    let client;
    try {
        client = bedrock.createClient({
            host: targetIp,
            port: port,
            username: username,
            offline: true,
            skipPing: true,        // Bỏ qua ping tự động để tránh treo socket
            connectTimeout: 45000  // Tăng thời gian chờ kết nối lên 45s
        });
    } catch (err) {
        console.log(`[!] Khởi tạo thất bại: ${err.message}. Thử lại sau 15s...`);
        setTimeout(connect, 15000);
        return;
    }

    client.on('join', () => {
        console.log(`[✓] Bot Bedrock ${username} ĐÃ CHUI VÀO SERVER THÀNH CÔNG!`);
    });

    client.on('end', (reason) => {
        console.log(`[-] Bot bị ngắt kết nối: ${reason}. Thử lại sau 15s...`);
        setTimeout(connect, 15000);
    });

    client.on('error', (err) => {
        console.log(`[!] Lỗi socket/kết nối: ${err.message}`);
    });
}

function connect() {
    dns.lookup(rawHost, (err, address) => {
        const ipToUse = (!err && address) ? address : rawHost;
        if (address) console.log(`[*] DNS Resolved: ${rawHost} -> ${address}`);
        startBot(ipToUse);
    });
}

connect();
