const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const { QuickDB } = require("quick.db");
const axios = require('axios');
const express = require('express'); // Thêm express

// --- PHẦN KEEP ALIVE CHO REPLIT ---
const app = express();
app.get('/', (req, res) => {
  res.send('Bot đang chạy 24/7!');
});
app.listen(3000, () => {
  console.log('🌐 Server Keep-Alive đã sẵn sàng tại port 3000');
});
// ----------------------------------

const db = new QuickDB();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions
    ],
});

const distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [new YouTubePlugin()],
});

const PREFIX = "!";
const WEATHER_API_KEY = "YOUR_WEATHER_KEY";

client.on('ready', () => {
    console.log(`✅ Đã đăng nhập: ${client.user.tag}`);
});

// ... (Các lệnh cũ: bal, pay, taixiu, baucua, p, weather, crypto, ban, kick, setup-verify giữ nguyên như bản trước) ...

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const authorId = message.author.id;

    // Ví dụ lệnh xem số tiền
    if (command === 'bal') {
        const bal = await db.get(`money_${authorId}`) || 1000;
        message.reply(`💰 Số dư của bạn: **${bal.toLocaleString()} xu**`);
    }

    // (Copy các lệnh khác từ code trước dán vào đây nhé ông)
});

client.login(process.env.TOKEN); // Dùng biến môi trường để bảo mật trên Replit