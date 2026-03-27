const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unmute',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('💀 Bạn không có quyền gỡ cách ly thành viên!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('💀 Bạn phải tag người cần gỡ mute! Ví dụ: `!unmute @user`');

        if (!target.communicationDisabledUntilTimestamp) {
            return message.reply('💀 Người này hiện tại không bị mute (tắt tiếng).');
        }

        try {
            await target.timeout(null);

            const unmuteEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔊 THÀNH VIÊN ĐÃ ĐƯỢC MỞ KHÓA')
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Người được tha', value: `${target.user.tag}`, inline: true },
                    { name: '👮 Người thực thi', value: `${message.author.username}`, inline: true }
                )
                .setFooter({ text: 'Hãy chú ý tuân thủ nội quy server nhé!' })
                .setTimestamp();

            await message.channel.send({ embeds: [unmuteEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('💀 Lỗi rồi! Kiểm tra xem Bot có đủ quyền hạn không nhé.');
        }
    },
};