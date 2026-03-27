const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'profile',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;

        let user = await User.findOne({ userId: target.id });
        if (!user) {
            if (target.id === message.author.id) {
                user = new User({ userId: target.id });
                await user.save();
            } else {
                return message.reply('❌ Người dùng này chưa có dữ liệu hệ thống!');
            }
        }
        const nextLevelXP = user.level * 100;
        const progress = Math.floor((user.xp / nextLevelXP) * 10);
        const bar = '🟩'.repeat(progress) + '⬜'.repeat(10 - progress);
        const percent = Math.floor((user.xp / nextLevelXP) * 100);

        const profileEmbed = new EmbedBuilder()
            .setColor('#00ff41')
            .setTitle(`👤 USER IDENTITY: ${target.username.toUpperCase()}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '🆔 USER ID', value: `\`${target.id}\``, inline: false },
                { name: '💰 BALANCE', value: `\`${user.money.toLocaleString()} $\``, inline: true },
                { name: '🛡️ LEVEL', value: `\`Lvl ${user.level}\``, inline: true },
                { name: '📊 EXPERIENCE', value: `\`${user.xp} / ${nextLevelXP} XP\` (${percent}%)\n${bar}`, inline: false }
            )
            .setFooter({ text: `System Scan: ${new Date().toLocaleString('vi-VN')}` })
            .setTimestamp();

        message.channel.send({ embeds: [profileEmbed] });
    },
};