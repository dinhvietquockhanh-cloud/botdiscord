const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'rank',
    async execute(message, args) {
        const user = await User.findOne({ userId: message.author.id });
        if (!user) return message.reply('💀 Bạn chưa có dữ liệu hệ thống!');

        const nextLevelXP = user.level * 100;
        const phanTram = Math.floor((user.xp / nextLevelXP) * 100);

        const rankEmbed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ name: `HỆ THỐNG CẤP ĐỘ - ${message.author.username.toUpperCase()}` })
            .setTitle('# ⭐【 THÔNG TIN CÁ NHÂN 】')
            .addFields(
                { name: '📊 Cấp độ', value: `> **Level ${user.level}**`, inline: true },
                { name: '✨ Kinh nghiệm', value: `> **${user.xp}/${nextLevelXP} XP**`, inline: true },
                { name: '📈 Tiến trình', value: `> [${'■'.repeat(Math.floor(phanTram/10))}${'□'.repeat(10 - Math.floor(phanTram/10))}] **${phanTram}%**` }
            )
            .setFooter({ text: 'Hãy chăm chỉ tương tác để nhận thưởng mỗi 10 Level!' })
            .setTimestamp();

        message.channel.send({ embeds: [rankEmbed] });
    },
};