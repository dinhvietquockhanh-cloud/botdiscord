const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'top',
    async execute(message, args) {
        const topUsers = await User.find()
            .sort({ money: -1, bank: -1 }) 
            .limit(10); 

        if (!topUsers || topUsers.length === 0) {
            return message.reply("❌ | Hiện chưa có ai có tên trong sổ đỏ của server!");
        }

        const embed = new EmbedBuilder()
            .setTitle('🔥 TOP 10 ĐẠI GIA KHÉT TIẾNG SERVER 🔥')
            .setColor('#2b2d31')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `Yêu cầu bởi: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        let description = "━━━━━━━━━━━━━━━━━━━━\n";

        for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const discordUser = await message.client.users.fetch(user.userId).catch(() => null);
            const tag = discordUser ? discordUser.username : "Ẩn danh";

            const total = (user.money || 0) + (user.bank || 0);

            let rankEmoji = "";
            if (i === 0) rankEmoji = "👑";
            else if (i === 1) rankEmoji = "💎";
            else if (i === 2) rankEmoji = "💰";
            else rankEmoji = `\`#${i + 1}\``;

            const progress = i === 0 ? "██████████" : "----------".substring(0, 10 - i) + "          ".substring(0, i);

            description += `${rankEmoji} **${tag}**\n`;
            description += `╰💰 Tổng: \`${total.toLocaleString()}\` xu\n`;
            description += `   └─ *Ví: ${user.money.toLocaleString()} | Bank: ${user.bank.toLocaleString()}*\n\n`;
        }

        description += "━━━━━━━━━━━━━━━━━━━━";
        embed.setDescription(description);

        message.reply({ embeds: [embed] });
    }
};