const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const express = require('express');
const User = require('./models/User'); 
require('dotenv').config();

// --- ID CONFIG (GIỮ NGUYÊN) ---
const TICKET_CATEGORY_ID = "1486614545198747749";
const ADMIN_ROLE_ID = "1401118146177404978";
const VERIFY_ROLE_ID = "1179312999111082036";
const WELCOME_CHANNEL_ID = "1179327119965302826";
const VERIFY_CHANNEL_ID = "1179309795497496656";
const RULES_CHANNEL_ID = "1179309928054280202";
const NEWS_CHANNEL_ID = "1440238187350851687";
const CHAT_CHANNEL_ID = "1463931008356192591";

const ADMIN_NAME = "DVQK4";
const VERSION = "v4.9.5-FIX-ALL-LOG-AND-WARNING";
const prefix = "!";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// --- HỆ THỐNG LOG CONSOLE ---
const log = async (msg, type = 'INFO') => {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] [${type}] ${msg}`);
};

// LOAD COMMANDS
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

// DB & SERVER
mongoose.connect(process.env.MONGO_URI).then(() => log("Kết nối Database thành công", "DB"));
const app = express();
app.get('/', (req, res) => res.send('SERVER ONLINE'));
app.listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);

client.once('ready', () => {
    log(`Hệ thống ${ADMIN_NAME} đã sẵn sàng trực chiến!`, "SUCCESS");
    client.user.setActivity(`${ADMIN_NAME} | !help`, { type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' });
});

// --- WELCOME (BẢN XỊN: COME VISIT ME IN HELL) ---
client.on('guildMemberAdd', async member => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (!welcomeChannel) return;
        const botAvatar = member.client.user.displayAvatarURL({ dynamic: true, size: 512 });
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2f3136') 
            .setAuthor({ name: `HỆ THỐNG QUẢN TRỊ`, iconURL: botAvatar })
            .setTitle(`🎊 PHÁT HIỆN LINH HỒN MỚI`)
            .setThumbnail(botAvatar)
            .setDescription(`Chào mừng <@${member.id}> gia nhập lãnh địa!\n\n> *Chúng tôi đã ghi nhận sự hiện diện của bạn vào kho lưu trữ dữ liệu.*`)
            .addFields(
                { name: '🛡️ NHIỆM VỤ', value: `Xác minh tại <#${VERIFY_CHANNEL_ID}>`, inline: false },
                { name: '📍 KHU VỰC', value: `<#${RULES_CHANNEL_ID}> | <#${NEWS_CHANNEL_ID}> | <#${CHAT_CHANNEL_ID}>`, inline: false }
            )
            .setImage('https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd29pbjd1OWRxcnI5c3c4Y3I2NzVlZXl1N2VhY3AzOHAzOWJjbGxxZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bU8qQZvfES4UM/giphy.gif')
            .setFooter({ text: `ID Thành viên: ${member.id} | Tổng: ${member.guild.memberCount}` })
            .setTimestamp();
        await welcomeChannel.send({ content: `||Chào mừng <@${member.id}>||`, embeds: [welcomeEmbed] });
    } catch (e) { log(e.message, "ERR"); }
});

// --- MESSAGE, XP & CONSOLE LOG ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- FORM CÀY XP CHO ÔNG ---
    let userData = await User.findOne({ userId: message.author.id });
    if (!userData) userData = new User({ userId: message.author.id, xp: 0, level: 1, lastMessage: 0 });

    const now = Date.now();
    if (now - userData.lastMessage > 60000) {
        userData.xp += Math.floor(Math.random() * 10) + 15;
        userData.lastMessage = now;
        if (userData.xp >= (userData.level * 150)) {
            userData.level += 1;
            userData.xp = 0;
            const lvMsg = await message.channel.send(`🎊 <@${message.author.id}> đột phá lên **Cấp ${userData.level}**!`);
            setTimeout(() => lvMsg.delete().catch(() => null), 5000); // Tự xóa sau 5s
        }
        await userData.save();
    }

    // --- HIỆN LỆNH TRONG CONSOLE ---
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    log(`${message.author.tag} gõ lệnh: ${prefix}${commandName} tại kênh: ${message.channel.name}`, "CMD");

    const command = client.commands.get(commandName);
    if (command) {
        try {
            setTimeout(() => message.delete().catch(() => null), 5000); // Tự xóa sau 5s
            await command.execute(message, args, log);
        } catch (e) { 
            log(`Lỗi lệnh ${commandName}: ${e.message}`, "ERR");
            const err = await message.channel.send(`❌ Lỗi: ${e.message}`);
            setTimeout(() => err.delete().catch(() => null), 5000);
        }
    }
});

// --- INTERACTION (FIX WARNING EPHEMERAL) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    log(`${interaction.user.tag} bấm nút: ${interaction.customId}`, "BTN");

    if (interaction.customId === 'verify_user' || interaction.customId === 'xacminh') {
        const role = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
        if (role) {
            await interaction.member.roles.add(role);
            // Dùng Flags thay vì ephemeral cũ
            await interaction.reply({ content: "🔥 Xác minh thành công!", flags: MessageFlags.Ephemeral });
        }
    }

    if (interaction.customId === 'create_ticket') {
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: ADMIN_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });
        const embed = new EmbedBuilder().setColor('#ff0000').setTitle('🎫 TICKET HỖ TRỢ').setDescription(`Chào <@${interaction.user.id}>, admin sẽ tới sau vài giây.`).setTimestamp();
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Đóng').setStyle(ButtonStyle.Danger));
        await ticketChannel.send({ content: `<@&${ADMIN_ROLE_ID}>`, embeds: [embed], components: [row] });
        await interaction.reply({ content: `✅ Đã mở: ${ticketChannel}`, flags: MessageFlags.Ephemeral });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply("🔒 Đóng ticket sau 5s...");
        setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
    }
});