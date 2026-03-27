const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
const VERSION = "v4.7.2-FIX-SPAM";
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
        const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
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
    if (sendToDiscord && client.isReady()) {
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

mongoose.connect(process.env.MONGO_URI)
    .then(() => log("Database Connected", "DB"))
    .catch(err => log(`Mongoose Error: ${err.message}`, 'ERR'));

const app = express();
app.get('/', (req, res) => res.send('CORE SYSTEM ONLINE'));
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    log(`Web Server Online: Port ${process.env.PORT || 3000}`, "SUCCESS");
});

client.login(process.env.TOKEN);

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
            .setDescription(`Chào mừng <@${member.id}> gia nhập lãnh địa!\n\n> *Dữ liệu của bạn đã được lưu trữ.*`)
            .addFields(
                { name: '🛡️ NHIỆM VỤ', value: `Xác minh tại <#${VERIFY_CHANNEL_ID}>`, inline: false },
                { name: '📍 KHU VỰC', value: `<#${RULES_CHANNEL_ID}> | <#${NEWS_CHANNEL_ID}> | <#${CHAT_CHANNEL_ID}>`, inline: false }
            )
            .setImage('https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd29pbjd1OWRxcnI5c3c4Y3I2NzVlZXl1N2VhY3AzOHAzOWJjbGxxZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bU8qQZvfES4UM/giphy.gif')
            .setFooter({ text: `ID: ${member.id} | Thành viên: ${member.guild.memberCount}` })
            .setTimestamp();

        await welcomeChannel.send({ content: `||Chào mừng <@${member.id}>||`, embeds: [welcomeEmbed] });
        log(`WELCOME: ${member.user.tag}`, "SUCCESS");
    } catch (e) { log(`Welcome Err: ${e.message}`, "ERR"); }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_user' || interaction.customId === 'xacminh') {
        const role = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
        if (!role) return interaction.reply({ content: "❌ Lỗi Role!", ephemeral: true });
        if (interaction.member.roles.cache.has(VERIFY_ROLE_ID)) return interaction.reply({ content: "✅ Đã xác minh!", ephemeral: true });

        await interaction.member.roles.add(role);
        await interaction.reply({ content: "🔥 Thành công!", ephemeral: true });
        log(`VERIFY: ${interaction.user.tag}`, "SUCCESS");
    }

    if (interaction.customId === 'create_ticket') {
        const channelName = `ticket-${interaction.user.username}`;
        const existing = interaction.guild.channels.cache.find(c => c.name === channelName);
        if (existing) return interaction.reply({ content: `❌ Bạn đã có Ticket!`, ephemeral: true });

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: ADMIN_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel] }
            ]
        });
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Đóng').setStyle(ButtonStyle.Danger)
        );
        await ticketChannel.send({ content: `<@${interaction.user.id}>`, components: [row] });
        await interaction.reply({ content: `✅ Đã tạo: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply("🔒 Đóng sau 5s...");
        setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    let user = await User.findOneAndUpdate(
        { userId: message.author.id },
        { $getOnInsert: { xp: 0, level: 1, money: 0, lastMessage: 0 } },
        { upsert: true, new: true }
    );

    const now = Date.now();
    if (now - (user.lastMessage || 0) > 60000) {
        user.xp += Math.floor(Math.random() * 10) + 5;
        user.lastMessage = now;
        if (user.xp >= (user.level * 100)) {
            user.level += 1;
            user.xp = 0;
            message.channel.send(`🎊 <@${message.author.id}> lên cấp **${user.level}**!`).catch(() => null);
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
        } catch (e) { log(`Err: ${e.message}`, "ERR"); }
    }
});

process.on('unhandledRejection', error => console.error('Unhandled Rejection:', error));