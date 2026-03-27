const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kick',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ Ông không có quyền "Sút" người khác đâu nhé!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Cú pháp: `!kick @user [lý do]`');
        }

        if (!target.kickable) {
            return message.reply('❌ Tôi không thể kick người này! (Có thể họ là Admin hoặc có Role cao hơn tôi).');
        }

        const reason = args.slice(1).join(' ') || 'Không có lý do cụ thể.';

        try {
            await target.kick(reason);

            const kickEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('👢 THÔNG BÁO KICK')
                .setDescription(`Đối tượng **${target.user.tag}** đã bị trục xuất khỏi server!`)
                .addFields(
                    { name: '👤 Người thực hiện', value: `${message.author.tag}`, inline: true },
                    { name: '📝 Lý do', value: `\`${reason}\``, inline: true }
                )
                .setThumbnail(target.user.displayAvatarURL())
                .setTimestamp();

            message.channel.send({ embeds: [kickEmbed] });
            console.log(`[LOG] ${message.author.tag} đã kick ${target.user.tag}. Lý do: ${reason}`);

        } catch (error) {
            console.error(error);
            message.reply('❌ Có lỗi xảy ra khi thực hiện lệnh kick!');
        }
    },
};