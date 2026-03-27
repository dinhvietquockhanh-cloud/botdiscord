const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'top',
    async execute(message, args) {
        
        const topUsers = await User.find()
            .sort({ money: -1, bank: -1 }) 
            .limit(10); 

        if (!topUsers || topUsers.length === 0) {
            return message.reply("Hiện chưa có ai có tiền trong bảng xếp hạng!");
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 BẢNG XẾP HẠNG ĐẠI GIA SERVER')
            .setColor(0xFFA500)
            .setThumbnail(message.guild.iconURL())
            .setTimestamp();

        let description = "";

        for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const discordUser = await message.client.users.fetch(user.userId).catch(() => null);
            const tag = discordUser ? discordUser.username : "Người dùng ẩn danh";

            
            const total = user.money + user.bank;

            
            let medal = `**#${i + 1}**`;
            if (i === 0) medal = "🥇";
            if (i === 1) medal = "🥈";
            if (i === 2) medal = "🥉";

            description += `${medal} **${tag}**: ${total.toLocaleString()} xu\n`;
        }

        embed.setDescription(description);

        message.reply({ embeds: [embed] });
    }
};