const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'restart',
    description: 'Khởi động lại hệ thống Core',
    async execute(message, args, log) {
        const ADMIN_ID = "735170332058452019"; 

        if (message.author.id !== ADMIN_ID) {
            return message.reply("❌ **CẢNH BÁO:** Ngươi không có quyền can thiệp vào hệ thống Core!");
        }

        const botAvatar = message.client.user.displayAvatarURL();
        
        const restartEmbed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setAuthor({ name: 'HỆ THỐNG QUẢN TRỊ CORE', iconURL: botAvatar })
            .setTitle('🔄 TIẾN HÀNH TÁI KHỞI ĐỘNG')
            .setDescription(
                `>>> **Trạng thái:** Đang ngắt kết nối tạm thời...\n` +
                `**Tiến trình:** Lưu trữ dữ liệu & Giải phóng bộ nhớ.`
            )
            .addFields({ name: '👤 Người thực hiện', value: `<@${message.author.id}>`, inline: true })
            .setFooter({ text: 'Render sẽ tự động phục hồi tiến trình sau 30s.' })
            .setTimestamp();

        await message.reply({ embeds: [restartEmbed] });

        if (log) {
            await log(`RESTART: Hệ thống được yêu cầu khởi động lại bởi ${message.author.tag}`, "CMD");
        }
        setTimeout(() => {
            console.log("\x1b[31m[RESTART]\x1b[0m Tiến trình đang thoát để Render tự bật lại...");
            process.exit(0);
        }, 2000);
    },
};