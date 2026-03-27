const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'top',
    async execute(message, args) {
        // Chỉ lấy Top 4 để đảm bảo giao diện cân đối và chuyên nghiệp
        const topUsers = await User.find()
            .sort({ money: -1, bank: -1 }) 
            .limit(4); 

        if (!topUsers || topUsers.length === 0) {
            return message.reply("❌ | Hệ thống chưa ghi nhận dữ liệu giao dịch nào!");
        }

        const embed = new EmbedBuilder()
            .setTitle('💎 BẢNG XẾP HẠNG TÀI SẢN HỆ THỐNG 💎')
            .setColor('#2ecc71') // Màu xanh lá tài chính (Success)
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `Truy xuất bởi: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        let description = "📊 **Danh sách 4 cá nhân có tổng tài sản lớn nhất**\n━━━━━━━━━━━━━━━━━━━━\n\n";

        for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const discordUser = await message.client.users.fetch(user.userId).catch(() => null);
            const tag = discordUser ? discordUser.username : "Người dùng hệ thống";
            
            const total = (user.money || 0) + (user.bank || 0);

            // Thứ hạng chuyên nghiệp
            let rankLabel = "";
            if (i === 0) rankLabel = "🥇 **TOP 1**";
            else if (i === 1) rankLabel = "🥈 **TOP 2**";
            else if (i === 2) rankLabel = "🥉 **TOP 3**";
            else rankLabel = "🏅 **TOP 4**";

            description += `${rankLabel} | **${tag}**\n`;
            description += `> 💠 Tổng tích lũy: \`${total.toLocaleString()}\` xu\n`;
            description += `> 💳 *Tiền mặt: ${user.money.toLocaleString()} | Ngân hàng: ${user.bank.toLocaleString()}*\n`;
            
            if (i < topUsers.length - 1) description += "─\n";
        }

        description += "\n━━━━━━━━━━━━━━━━━━━━";
        embed.setDescription(description);

        message.reply({ embeds: [embed] });
    }
};