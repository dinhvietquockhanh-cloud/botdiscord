const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'report',
    async execute(message, args) {
        const ID_ROOM_ADMIN_LOG = '1179308862029959248';

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(' ');

        if (!target || !reason) {
            return message.reply('💀 Cú pháp: `!report @user [Lý do]`');
        }

        const adminChannel = message.client.channels.cache.get(ID_ROOM_ADMIN_LOG);
        if (!adminChannel) return message.reply('💀 Lỗi hệ thống: Không tìm thấy kênh Admin!');

        await message.reply('✅ Đơn tố cáo của bạn đã được gửi kín cho Ban Quản Trị. Cảm ơn bạn!');

        if (message.deletable) await message.delete().catch(() => {});
        const reportEmbed = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle('🚨 CÓ ĐƠN TỐ CÁO MỚI!')
            .addFields(
                { name: '👤 Người bị tố cáo', value: `${target} (ID: ${target.id})`, inline: true },
                { name: '✍️ Người gửi đơn', value: `${message.author} (ID: ${message.author.id})`, inline: true },
                { name: '📝 Lý do', value: `> ${reason}` },
                { name: '📍 Tại kênh', value: `<#${message.channel.id}>` }
            )
            .setTimestamp()
            .setThumbnail(target.user.displayAvatarURL());

        await adminChannel.send({ embeds: [reportEmbed] });
    },
};