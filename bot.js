const bedrock = require('bedrock-protocol');
const dns = require('dns');

process.on('uncaughtException', (err) => {
    console.log('[!] Lỗi ngầm:', err.message);
});

const rawHost = process.env.SERVER_HOST || 'drum.aternos.host';
const port = parseInt(process.env.SERVER_PORT || '19132');
const username = 'nhinmegi_' + Math.floor(Math.random() * 90 + 10);

function startBot(hostIp) {
    console.log(`[+] Đang đâm thẳng Bedrock tới ${hostIp}:${port} với tên ${username}...`);

    let client;
    try {
        client = bedrock.createClient({
            host: hostIp,
            port: port,
            username: username,
            offline: true,
            skipPing: true,
            connectTimeout: 30000 // Tăng thời gian chờ kết nối lên 30 giây
        });
    } catch (err) {
        console.log(`[!] Lỗi khởi tạo: ${err.message}. Thử lại sau 15s...`);
        setTimeout(() => connect(), 15000);
        return;
    }

    client.on('join', () => {
        console.log(`[✓] Bot Bedrock ${username} ĐÃ VÀO SERVER THÀNH CÔNG!`);
    });

    client.on('end', (reason) => {
        console.log(`[-] Bị ngắt kết nối: ${reason}. Đang thử kết nối lại sau 15 giây...`);
        setTimeout(() => connect(), 15000);
    });

    client.on('error', (err) => {
        console.log(`[!] Lỗi socket/kết nối: ${err.message}`);
    });
}

function connect() {
    // Phân giải tên miền thành IP số để tránh lỗi UDP Timeout trên GitHub Actions
    dns.lookup(rawHost, (err, address) => {
        if (err || !address) {
            console.log(`[!] Không lấy được IP từ host ${rawHost}, thử dùng host gốc...`);
            startBot(rawHost);
        } else {
            console.log(`[*] Đã dịch tên miền ${rawHost} -> IP: ${address}`);
            startBot(address);
        }
    });
}

connect();
