const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'setup-verify',
    description: 'Thiết lập bảng điều khiển xác minh linh hồn cho Server.',
    async execute(message, args, log) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Ngươi không đủ quyền hạn để triệu hồi cổng trục xuất này!");
        }

        const satanGif = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTdwMzQ2MWx5OTFvZzYyZGxwZDcxbjBuM2tyemRjOWRwZmNlbTFlYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1KVaGr2NKkBtpSrS/giphy.gif';

        const embed = new EmbedBuilder()
            .setTitle('🔥 CỔNG TRỤC XUẤT & XÁC MINH 🔥')
            .setDescription('**Chào mừng linh hồn lạc lối đã đến với lãnh địa.**\n\nĐể bước tiếp vào bóng tối và nhìn thấy toàn bộ bí mật của server, ngươi phải cam kết tuân thủ luật lệ của chúng ta.\n\n🔻 **Nhấn vào nút bên dưới để hiến tế sự xác minh!**')
            .setColor(0x660000) 
            .setImage(satanGif)  
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { name: '📜 Quy tắc', value: 'Không spam, không toxic, tôn trọng quỷ dữ.', inline: false }
            )
            .setFooter({ text: 'The Devil is watching you...', iconURL: message.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify_user')
                .setLabel('XÁC MINH LINH HỒN')
                .setEmoji('🔱') 
                .setStyle(ButtonStyle.Danger) 
        );

        try {
            await message.channel.send({ embeds: [embed], components: [row] });

            if (message.deletable) await message.delete();

            if (log) log(`SETUP-VERIFY: ${message.author.tag} đã thiết lập cổng xác minh tại #${message.channel.name}`, "SUCCESS");
        } catch (e) {
            if (log) log(`Lỗi gửi Setup-Verify: ${e.message}`, "ERR");
            message.reply("❌ Có lỗi xảy ra khi thiết lập bảng xác minh!");
        }
    }
};