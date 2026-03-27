const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Xóa tin nhắn trong kênh',
    async execute(message, args, log) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("❌ Ngươi không có đủ quyền hạn để thực hiện lệnh này!");
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount)) {
            return message.reply("❓ Ngươi muốn xóa bao nhiêu tin? (Ví dụ: `!clear 10`)");
        }

        if (amount <= 0 || amount > 100) {
            return message.reply("⚠️ Số lượng tin nhắn xóa phải từ 1 đến 100.");
        }

        try {
            if (message.deletable) await message.delete().catch(() => null);

            const deleted = await message.channel.bulkDelete(amount, true);

            const successEmbed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setDescription(`✅ Đã trục xuất **${deleted.size}** linh hồn (tin nhắn) khỏi kênh này.`)
                .setFooter({ text: 'Tin nhắn cũ hơn 14 ngày không thể bị xóa theo cách này.' });

            const msg = await message.channel.send({ embeds: [successEmbed] });

            setTimeout(() => {
                msg.delete().catch(() => null);
            }, 3000);

            log(`Admin ${message.author.tag} đã xóa ${deleted.size} tin nhắn tại #${message.channel.name}`, "CMD");

        } catch (error) {
            log(`Lỗi lệnh clear: ${error.message}`, "ERR");
            message.channel.send("❌ Có lỗi xảy ra khi cố gắng dọn dẹp kênh này!");
        }
    },
};