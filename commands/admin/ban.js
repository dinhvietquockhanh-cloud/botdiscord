const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('💀 Bạn không có quyền "Ban thành viên" để thực hiện lệnh này!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('💀 Bạn phải tag người cần ban! Ví dụ: `!ban @user lý do`');

        if (target.id === message.author.id) return message.reply('💀 Không thể tự ban chính mình!');
        if (!target.bannable) return message.reply('💀 Bot không đủ quyền để ban người này (thứ tự Role thấp hơn)!');

        const reason = args.slice(1).join(' ') || 'Vi phạm nội quy server';

        try {+
            
            await target.ban({ reason: reason });

            const banEmbed = new EmbedBuilder()
                .setColor('#8B0000') 
                .setTitle('⚖️ THÀNH VIÊN ĐÃ BỊ TRỤC XUẤT (BAN)')
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Đối tượng', value: `**${target.user.tag}**`, inline: true },
                    { name: '👮 Người thực thi', value: `**${message.author.username}**`, inline: true },
                    { name: '📝 Lý do vi phạm', value: `> *${reason}*` }
                )
                .setFooter({ text: 'Quyết định cuối cùng từ Ban Quản Trị' })
                .setTimestamp();

            await message.channel.send({ embeds: [banEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('💀 Đã xảy ra lỗi khi thực hiện lệnh ban!');
        }
    },
};