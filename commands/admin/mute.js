const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms'); 

module.exports = {
    name: 'mute',
    async execute(message, args) {
        
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('💀 Bạn không có quyền "Cách ly thành viên" để dùng lệnh này!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('💀 Bạn phải tag người cần mute! Ví dụ: `!mute @user 10m lý do`');

        if (target.id === message.author.id) return message.reply('💀 Đừng tự mute chính mình chứ bro!');

        
        const time = args[1]; 
        if (!time || !ms(time)) return message.reply('💀 Nhập thời gian hợp lệ (ví dụ: 10m, 1h, 1d)!');

        const reason = args.slice(2).join(' ') || 'Không có lý do';

        try {
            
            const duration = ms(time);

            
            await target.timeout(duration, reason);

            const muteEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔇 THÀNH VIÊN ĐÃ BỊ TẮT TIẾNG')
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Người bị phạt', value: `${target.user.tag}`, inline: true },
                    { name: '⏳ Thời gian', value: `**${time}**`, inline: true },
                    { name: '✍️ Lý do', value: `*${reason}*` },
                    { name: '👮 Người thực thi', value: `${message.author.username}` }
                )
                .setFooter({ text: 'Vi phạm nội quy sẽ bị xử lý nghiêm!' })
                .setTimestamp();

            await message.channel.send({ embeds: [muteEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('💀 Lỗi! Có thể do Role của Bot thấp hơn Role của người này.');
        }
    },
};