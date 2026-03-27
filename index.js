const { Client, GatewayIntentBits, Collection, EmbedBuilder , ActivityType, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const express = require('express'); 
const User = require('./models/User'); 
require('dotenv').config();

const TICKET_CATEGORY_ID = "1486614545198747749";
const ADMIN_ROLE_ID = "1401118146177404978";
const LOG_CHANNEL_ID = "1486412768952188948";  
const VERIFY_ROLE_ID = "1179312999111082036";

const WELCOME_CHANNEL_ID = "1179327119965302826";
const VERIFY_CHANNEL_ID = "1179309795497496656";
const RULES_CHANNEL_ID = "1179309928054280202";
const NEWS_CHANNEL_ID = "1440238187350851687";
const CHAT_CHANNEL_ID = "1463931008356192591";
const TICKET_CHANNEL_ID = "1486412768952188948";

const ADMIN_NAME = "DVQK4"; 
const ADMIN_ID = "764512345678901234";
const VERSION = "v4.7.1-WELCOME-UPGRADE";
const prefix = "!";

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildVoiceStates
    ] 
});

client.commands = new Collection();

const c = {
    red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", 
    blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m", 
    white: "\x1b[37m", gray: "\x1b[90m", reset: "\x1b[0m", bold: "\x1b[1m"
};

async function sendRemoteLog(content, status = 'INFO') {
    try {
        const channel = await client.channels.fetch(LOG_CHANNEL_ID);
        if (!channel) return;
        const statusColors = { 'INFO': '#3498db', 'SUCCESS': '#2ecc71', 'ERR': '#e74c3c', 'DB': '#9b59b6', 'CMD': '#1abc9c' };
        const embed = new EmbedBuilder()
            .setColor(statusColors[status] || '#2f3136')
            .setDescription(`\`\`\`ansi\n${content}\n\`\`\``)
            .setFooter({ text: `${ADMIN_NAME} CORE` })
            .setTimestamp();
        await channel.send({ embeds: [embed] });
    } catch (e) { console.log(`[!] Log Fail: ${e.message}`); }
}

const log = async (msg, type = 'INFO', sendToDiscord = true) => {
    const time = new Date().toLocaleTimeString();
    let color = c.white;
    if (type === 'SUCCESS') color = c.green;
    if (type === 'ERR') color = c.red;
    if (type === 'DB') color = c.magenta;
    if (type === 'CMD') color = c.cyan;
    console.log(`${c.gray}[${time}]${c.reset} ${color}${c.bold}[${type}]${c.reset} ${msg}`);
    if (sendToDiscord) {
        const ansiMsg = `[90m[${time}][0m ${color === c.green ? '[32m' : color === c.red ? '[31m' : color === c.magenta ? '[35m' : color === c.cyan ? '[36m' : '[37m'}[${type}][0m ${msg}`;
        await sendRemoteLog(ansiMsg, type);
    }
};

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

mongoose.connect(process.env.MONGO_URI).then(() => {
    const app = express();
    app.get('/', (req, res) => res.send('ONLINE'));
    app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
        log("Database & Web Port: Online", "DB");
        client.login(process.env.TOKEN);
    });
}).catch(err => log(`Mongoose Error: ${err.message}`, 'ERR'));

client.once('ready', async () => {
    process.stdout.write('\x1Bc');
    const banner = `[31mCORE SYSTEM READY - VERSION: ${VERSION}[0m`;
    console.log(banner);
    await sendRemoteLog(banner, 'SUCCESS');
    client.user.setActivity(`${ADMIN_NAME} | !help`, { type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' });
});

client.on('guildMemberAdd', async member => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (!welcomeChannel) return;

        const botAvatar = member.client.user.displayAvatarURL({ dynamic: true, size: 512 });

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2f3136') 
            .setAuthor({ name: `HỆ THỐNG QUẢN TRỊ ${member.guild.name.toUpperCase()}`, iconURL: botAvatar })
            .setTitle(`🎊 PHÁT HIỆN LINH HỒN MỚI`)
            .setThumbnail(botAvatar)
            .setDescription(
                `Chào mừng <@${member.id}> (${member.user.username}) đã đặt chân tới lãnh địa!\n\n` +
                `> *Chúng tôi đã ghi nhận sự hiện diện của bạn vào kho lưu trữ dữ liệu.*`
            )
            .addFields(
                { 
                    name: '🛡️ NHIỆM VỤ BẮT BUỘC', 
                    value: `Di chuyển ngay tới kênh <#${VERIFY_CHANNEL_ID}> để **Xác Minh**. Hệ thống sẽ tự động trục xuất những kẻ chưa xác minh sau một khoảng thời gian!`, 
                    inline: false 
                },
                {
                    name: '📍 CÁC KHU VỰC CẦN BIẾT',
                    value: `• **Luật lệ:** <#${RULES_CHANNEL_ID}>\n• **Tin tức:** <#${NEWS_CHANNEL_ID}>\n• **Sảnh chat:** <#${CHAT_CHANNEL_ID}>\n• **Hỗ trợ:** <#${TICKET_CHANNEL_ID}>`,
                    inline: false
                }
            )
            .setImage('https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd29pbjd1OWRxcnI5c3c4Y3I2NzVlZXl1N2VhY3AzOHAzOWJjbGxxZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bU8qQZvfES4UM/giphy.gif')
            .setFooter({ text: `ID Thành viên: ${member.id} | Tổng: ${member.guild.memberCount}`, iconURL: botAvatar })
            .setTimestamp();

        await welcomeChannel.send({ 
            content: `||Chào mừng <@${member.id}> gia nhập!||`, 
            embeds: [welcomeEmbed] 
        });

        log(`WELCOME: ${member.user.tag} gia nhập.`, "SUCCESS");
    } catch (e) {
        log(`Lỗi Welcome: ${e.message}`, "ERR");
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_user' || interaction.customId === 'xacminh') {
        try {
            const role = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
            if (!role) return interaction.reply({ content: "❌ Sai ID Role xác minh trong main.js", ephemeral: true });

            if (interaction.member.roles.cache.has(VERIFY_ROLE_ID)) {
                return interaction.reply({ content: "✅ Bạn đã xác minh rồi!", ephemeral: true });
            }

            await interaction.member.roles.add(role);
            await interaction.reply({ content: "🔥 Xác minh thành công! Bạn đã có quyền truy cập các kênh chat.", ephemeral: true });
            log(`VERIFY: ${interaction.user.tag} thành công`, "SUCCESS");
        } catch (e) {
            log(`Lỗi Verify: ${e.message}`, "ERR");
            interaction.reply({ content: "❌ Bot thiếu quyền cấp Role!", ephemeral: true });
        }
    }

    if (interaction.customId === 'create_ticket' || interaction.customId === 'ticket_open') {
        try {
            const channelName = `ticket-${interaction.user.username}`;
            const existing = interaction.guild.channels.cache.find(c => c.name.toLowerCase() === channelName.toLowerCase());

            if (existing) return interaction.reply({ content: `❌ Bạn đang có một Ticket đang mở tại ${existing}`, ephemeral: true });

            const category = interaction.guild.channels.cache.get(TICKET_CATEGORY_ID);
            if (!category) return interaction.reply({ content: `❌ Lỗi: Danh mục Ticket không tồn tại hoặc sai ID.`, ephemeral: true });

            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY_ID,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: ADMIN_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ]
            });

            const botAvatar = client.user.displayAvatarURL();
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ name: 'DVQK4 SUPPORT SYSTEM', iconURL: botAvatar })
                .setTitle('🎫 TICKET HỖ TRỢ ĐÃ ĐƯỢC KHỞI TẠO')
                .setDescription(`Chào <@${interaction.user.id}>,\nCảm ơn bạn đã liên hệ. Đội ngũ Staff sẽ hỗ trợ bạn sớm nhất có thể.\n\n**Vui lòng cung cấp nội dung bạn cần hỗ trợ bên dưới.**`)
                .addFields(
                    { name: '👤 Người yêu cầu', value: `${interaction.user.tag}`, inline: true },
                    { name: '⏰ Thời gian', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'Nhấn nút bên dưới để đóng Ticket này' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Đóng Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `<@${interaction.user.id}> | <@&${ADMIN_ROLE_ID}>`, embeds: [embed], components: [row] });
            await interaction.reply({ content: `✅ Đã tạo kênh hỗ trợ cho bạn: ${ticketChannel}`, ephemeral: true });

            log(`TICKET: ${interaction.user.tag} đã mở một yêu cầu hỗ trợ.`, "CMD");
        } catch (e) {
            log(`Lỗi tạo Ticket: ${e.message}`, "ERR");
            interaction.reply({ content: "❌ Không thể tạo Ticket. Kiểm tra lại quyền của Bot!", ephemeral: true });
        }
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: "🔒 Hệ thống đang tiến hành đóng Ticket và dọn dẹp dữ liệu sau 5 giây..." });
        log(`TICKET: Kênh ${interaction.channel.name} đang bị đóng.`, "INFO");
        setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    if (message.content === `${prefix}setup-ticket`) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Bạn cần quyền Quản trị viên để dùng lệnh này.");
        }

        const ticketEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: 'TRUNG TÂM HỖ TRỢ LINH HỒN', iconURL: client.user.displayAvatarURL() })
            .setDescription(
                `Nếu ngươi gặp vấn đề, bị kẹt trong hư vô hoặc muốn tố cáo kẻ phản bội, hãy nhấn vào nút bên dưới để tạo một bàn sơ (Ticket).\n\n` +
                `🔹 **Lưu ý:** Vui lòng không tạo Ticket lung tung nếu không muốn bị trục xuất!`
            )
            .setThumbnail('https://images-ext-1.discordapp.net/external/de8RS2ApebcKwy6vqfnncyUN5RAVhw1Eq3Z9OMJsMso/https/cdn.discordapp.com/avatars/1486224855358771383/6ba04a53cc2a3e075a41e7fd438c408e.webp')
            .setFooter({ text: 'Hệ thống hỗ trợ đang trực tuyến', iconURL: client.user.displayAvatarURL() });


        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('MỞ TICKET')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [ticketEmbed], components: [row] });
        if (message.deletable) message.delete();
        return;
    }

    let user = await User.findOneAndUpdate(
        { userId: message.author.id },
        { $setOnInsert: { xp: 0, level: 1, money: 0, lastMessage: 0 } },
        { upsert: true, returnDocument: 'after' } 
    );

    const now = Date.now();
    if (now - user.lastMessage > 60000) {
        user.xp += Math.floor(Math.random() * 10) + 5;
        user.lastMessage = now;
        if (user.xp >= (user.level * 100)) {
            user.level += 1;
            user.xp = 0;
            message.channel.send(`🎊 Chúc mừng <@${message.author.id}> lên cấp **${user.level}**!`).catch(() => null);
        }
        await user.save();
    }

    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (command) {
        try {
            await command.execute(message, args, log);
        } catch (e) { log(`Lỗi: ${e.message}`, "ERR"); }
    }
});

process.on('unhandledRejection', error => log(error.message, 'ERR'));