const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'setup-ticket',
    description: 'Thiết lập bảng điều khiển hỗ trợ (Ticket).',
    async execute(message, args, log) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Ngươi không đủ quyền hạn để thiết lập hệ thống hỗ trợ!");
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 TRUNG TÂM HỖ TRỢ LINH HỒN')
            .setDescription('Nếu ngươi gặp vấn đề, bị kẹt trong hư vô hoặc muốn tố cáo kẻ phản bội, hãy nhấn vào nút bên dưới để tạo một bản sớ (Ticket).\n\n🔹 **Lưu ý:** Vui lòng không tạo Ticket lung tung nếu không muốn bị trục xuất!')
            .setColor('#3498db')
            .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ 
                text: 'Hệ thống hỗ trợ đang trực tuyến', 
                iconURL: message.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('MỞ TICKET')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        if (message.deletable) await message.delete();

        if (log) log(`TICKET-SETUP: ${message.author.tag} đã thiết lập tại #${message.channel.name}`, "SUCCESS");
    }
};