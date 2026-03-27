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
const VERSION = "v4.7.6-FINAL-AUTO-DELETE";
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

const log = async (msg, type = 'INFO') => {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] [${type}] ${msg}`);
};

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

mongoose.connect(process.env.MONGO_URI).then(() => log("DB Connected", "DB"));
const app = express();
app.get('/', (req, res) => res.send('ONLINE'));
app.listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);

client.once('ready', () => {
    log(`${ADMIN_NAME} Ready - Version ${VERSION}`, "SUCCESS");
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

        const sentWelcome = await welcomeChannel.send({ content: `||Chào mừng <@${member.id}>||`, embeds: [welcomeEmbed] });
        
        // Tự động xóa tin nhắn chào mừng sau 5s nếu ông muốn kênh sạch (tùy chọn)
        // setTimeout(() => sentWelcome.delete().catch(() => null), 5000); 

    } catch (e) { log(`Welcome Err: ${e.message}`, "ERR"); }
});

// --- INTERACTION (VERIFY & TICKET) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    // VERIFY FIX
    if (interaction.customId === 'verify_user' || interaction.customId === 'xacminh') {
        const role = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
        if (!role) return interaction.reply({ content: "❌ Lỗi Role!", ephemeral: true });
        if (interaction.member.roles.cache.has(VERIFY_ROLE_ID)) return interaction.reply({ content: "✅ Đã xác minh!", ephemeral: true });

        await interaction.member.roles.add(role);
        const reply = await interaction.reply({ content: "🔥 Xác minh thành công!", fetchReply: true });
        setTimeout(() => interaction.deleteReply().catch(() => null), 5000);
    }

    // TICKET BOX
    if (interaction.customId === 'create_ticket') {
        try {
            const channelName = `ticket-${interaction.user.username}`;
            const existing = interaction.guild.channels.cache.find(c => c.name.toLowerCase() === channelName.toLowerCase());
            if (existing) {
                const reply = await interaction.reply({ content: "❌ Bạn đã mở ticket rồi!", ephemeral: true });
                return;
            }

            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY_ID,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: ADMIN_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🎫 HỆ THỐNG HỖ TRỢ DVQK4')
                .setDescription(`Chào <@${interaction.user.id}>, vui lòng mô tả vấn đề.`)
                .addFields(
                    { name: '👤 Chủ Ticket', value: `${interaction.user.tag}`, inline: true },
                    { name: '⏰ Thời gian', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('Đóng Ticket').setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `<@${interaction.user.id}> | <@&${ADMIN_ROLE_ID}>`, embeds: [embed], components: [row] });
            const reply = await interaction.reply({ content: `✅ Đã tạo kênh: ${ticketChannel}`, ephemeral: true });
        } catch (e) { log(e.message, "ERR"); }
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply("🔒 Đóng sau 5s...");
        setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
    }
});

// --- MESSAGE & AUTO DELETE ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Logic Level/XP
    let user = await User.findOneAndUpdate(
        { userId: message.author.id },
        { $setOnInsert: { xp: 0, level: 1, money: 0, lastMessage: 0 } },
        { upsert: true, new: true }
    );
    const now = Date.now();
    if (now - (user.lastMessage || 0) > 60000) {
        user.xp += Math.floor(Math.random() * 10) + 5;
        user.lastMessage = now;
        if (user.xp >= (user.level * 100)) {
            user.level += 1;
            user.xp = 0;
            const lvMsg = await message.channel.send(`🎊 <@${message.author.id}> lên cấp **${user.level}**!`);
            setTimeout(() => lvMsg.delete().catch(() => null), 5000); // Tự xóa thông báo lên cấp
        }
        await user.save();
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (command) {
        try {
            // Thực thi lệnh và tự động xóa lệnh gõ của user sau 5s
            setTimeout(() => message.delete().catch(() => null), 5000);
            await command.execute(message, args, log);
        } catch (e) { 
            const errMsg = await message.channel.send(`❌ Lỗi: ${e.message}`);
            setTimeout(() => errMsg.delete().catch(() => null), 5000);
        }
    }
});