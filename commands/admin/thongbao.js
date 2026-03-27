const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'thongbao',
    async execute(message, args) {
        const ID_ROOM_THONG_BAO = '1440238187350851687'; 
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('💀 Quyền hạn không đủ!');
        }
        const contentRaw = args.join(' ');
        const anhUpTrucTiep = message.attachments.first() ? message.attachments.first().url : null;

        if (!contentRaw && !anhUpTrucTiep) {
            return message.reply('💀 Nhập nội dung hoặc Up kèm 1 cái ảnh đi bro!');
        }
        const [text, imageLink] = contentRaw.split('|').map(s => s.trim());

        const channel = message.client.channels.cache.get(ID_ROOM_THONG_BAO);
        if (!channel) return message.reply('💀 Room không tồn tại!');

        try {
            const thongBaoEmbed = new EmbedBuilder()
                .setColor('#FFFFFF') 
                .setAuthor({ 
                    name: '━━━━━ 📢 HỆ THỐNG THÔNG BÁO ━━━━━', 
                    iconURL: message.guild.iconURL() 
                })
                .setTitle('# 📢【 THÔNG BÁO MỚI 】')
                .setDescription(`\n**${text || 'Thông báo từ Ban Quản Trị'}**\n\n`) 
                .setThumbnail(message.guild.iconURL())
                .setImage(anhUpTrucTiep || imageLink || null) 
                .setFooter({ 
                    text: `✍️ Người đăng: ${message.author.username.toUpperCase()}`, 
                    iconURL: message.author.displayAvatarURL() 
                })
                .setTimestamp();

            
            await channel.send({ content: '@everyone', embeds: [thongBaoEmbed] });
            await message.reply(`✅ Đã đăng thông báo lên <#${ID_ROOM_THONG_BAO}>`);
        } catch (error) {
            console.error(error);
            message.reply('💀 Lỗi rồi bro! Check lại link ảnh hoặc file đính kèm nhé.');
        }
    },
};