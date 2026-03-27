const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'say',
    async execute(message, args) {
        
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('💀 Lệnh này chỉ dành cho **ADMIN** thực thụ thôi bro!');
        }

        
        const noiDung = args.join(' ');
        if (!noiDung) return message.reply('💀 Nhập nội dung cần nói đê! Ví dụ: `!say Chào cả nhà`');

        try {
            
            if (message.deletable) {
                await message.delete().catch(() => {});
            }

            
            const sayEmbed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setAuthor({ 
                    name: '━━━━━ 📢 THÔNG ĐIỆP HỆ THỐNG ━━━━━', 
                    iconURL: message.guild.iconURL() 
                })
                .setDescription(`\n**${noiDung}**\n`) 
                .setFooter({ text: 'Gửi từ Ban Quản Trị' })
                .setTimestamp();

            await message.channel.send({ embeds: [sayEmbed] });

        } catch (error) {
            console.error(error);
            
            message.channel.send('💀 Lỗi hệ thống: Không thể truyền tải thông điệp!');
        }
    },
};