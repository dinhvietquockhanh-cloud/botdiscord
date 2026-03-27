const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
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

const ADMIN_NAME = "DVQK4";
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

const log = async (msg, type = 'INFO') => {
    const time = new Date().toLocaleTimeString();
    const logText = `[${time}] [${type}] ${msg}`;
    console.log(logText); 

    try {
        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const colors = { 'INFO': '#ffffff', 'SUCCESS': '#00ff00', 'ERR': '#ff0000', 'CMD': '#00ffff' };
            const logEmbed = new EmbedBuilder()
                .setColor(colors[type] || '#ffffff')
                .setDescription(`\`\`\`${logText}\`\`\``);
            await logChannel.send({ embeds: [logEmbed] });
        }
    } catch (e) { console.error("Lỗi log:", e.message); }
};

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

mongoose.connect(process.env.MONGO_URI).then(() => log("Database Connected!", "SUCCESS"));
const app = express();
app.get('/', (req, res) => res.send('SERVER ONLINE'));
app.listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);

client.once('ready', () => {
    log(`${ADMIN_NAME} Online - Đã fix lỗi prefix và ticket`, "SUCCESS");
    client.user.setActivity(`${ADMIN_NAME} | !help`, { type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' });
});

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
            .setDescription(`Chào mừng <@${member.id}> đã đặt chân tới lãnh địa!\n\n> *Chúng tôi đã ghi nhận sự hiện diện của bạn vào kho lưu trữ dữ liệu.*`)
            .addFields(
                { name: '🛡️ NHIỆM VỤ BẮT BUỘC', value: `Di chuyển tới <#${VERIFY_CHANNEL_ID}> để **Xác Minh**.`, inline: false },
                { name: '📍 CÁC KHU VỰC CẦN BIẾT', value: `• Luật lệ: <#${RULES_CHANNEL_ID}>\n• Tin tức: <#${NEWS_CHANNEL_ID}>\n• Sảnh chờ: <#${CHAT_CHANNEL_ID}>`, inline: false }
            )
            .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif') // Link GIF HELL của ông
            .setFooter({ text: `ID Thành viên: ${member.id} | Tổng: ${member.guild.memberCount}` })
            .setTimestamp();
        await welcomeChannel.send({ content: `||Chào mừng <@${member.id}>||`, embeds: [welcomeEmbed] });
    } catch (e) { log(e.message, "ERR"); }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    let userData = await User.findOne({ userId: message.author.id });
    if (!userData) userData = new User({ userId: message.author.id, xp: 0, level: 1, lastMessage: 0 });

    const now = Date.now();
    if (now - userData.lastMessage > 60000) {
        userData.xp += Math.floor(Math.random() * 10) + 15;
        userData.lastMessage = now;
        if (userData.xp >= (userData.level * 150)) {
            userData.level += 1;
            userData.xp = 0;
            const lvMsg = await message.channel.send(`🎊 Chúc mừng <@${message.author.id}> lên **Cấp ${userData.level}**!`);
            setTimeout(() => lvMsg.delete().catch(() => null), 5000);
        }
        await userData.save();
    }

    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    log(`${message.author.tag} gõ lệnh: ${prefix}${commandName}`, "CMD");

    const command = client.commands.get(commandName);
    if (command) {
        try {
            setTimeout(() => message.delete().catch(() => null), 5000);
            await command.execute(message, args, log);
        } catch (e) { log(`Lỗi: ${e.message}`, "ERR"); }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_user' || interaction.customId === 'xacminh') {
        const role = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
        if (role) {
            await interaction.member.roles.add(role);
            await interaction.reply({ content: "🔥 Đã xác minh thành công!", flags: MessageFlags.Ephemeral });
        }
    }

    if (interaction.customId === 'create_ticket') {
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: ADMIN_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: `HỆ THỐNG HỖ TRỢ DVQK4`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('🎫 ĐÃ TIẾP NHẬN YÊU CẦU')
            .setDescription(`Chào <@${interaction.user.id}>, admin sẽ hỗ trợ bạn sớm nhất.`)
            .addFields(
                { name: '👤 Chủ Ticket', value: `${interaction.user.tag}`, inline: true },
                { name: '⏰ Thời gian mở', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'ĐÓNG' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Đóng').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `<@&${ADMIN_ROLE_ID}>`, embeds: [ticketEmbed], components: [row] });
        await interaction.reply({ content: `✅ Đã tạo kênh hỗ trợ: ${ticketChannel}`, flags: MessageFlags.Ephemeral });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply("🔒 Ticket sẽ được đóng sau 5 giây...");
        setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
    }
});