const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'checkpc',
    async execute(message, args) {
        const user = await User.findOne({ userId: message.author.id });
        if (!user) return message.reply('💀 Bạn chưa có máy tính! Hãy thử `!mine` trước.');

        const pcLevel = user.pcLevel || 1;
        const nextUpgrade = pcLevel * 5000;

        const checkEmbed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setAuthor({ name: `💻 THÔNG SỐ PHẦN CỨNG - ${message.author.username.toUpperCase()}` })
            .setTitle('# 🖥️【 HACKER RIG SYSTEM 】')
            .addFields(
                { name: '📊 Cấp độ hệ thống', value: `> **Level ${pcLevel}**`, inline: true },
                { name: '⚡ Hiệu suất khai thác', value: `> **x${pcLevel}.0**`, inline: true },
                { name: '💰 Giá nâng cấp tiếp', value: `> **${nextUpgrade}$**` }
            )
            .setDescription(`\n*Máy tính Level càng cao, tỉ lệ đào được Bitcoin giá trị lớn càng tăng!*\n`)
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: 'Hệ thống đang hoạt động ổn định...' })
            .setTimestamp();

        message.channel.send({ embeds: [checkEmbed] });
    },
};