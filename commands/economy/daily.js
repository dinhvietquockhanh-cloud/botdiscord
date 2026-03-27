const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'daily',
    async execute(message, args) {
        let userData = await User.findOne({ userId: message.author.id });
        if (!userData) userData = await User.create({ userId: message.author.id });

        const dailyAmount = 5000; 
        const cooldown = 86400000; 
        const lastDaily = userData.lastDaily || 0;

        if (Date.now() - lastDaily < cooldown) {
            const timeLeft = cooldown - (Date.now() - lastDaily);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return message.reply(`⏳ Bạn đã điểm danh rồi! Hãy quay lại sau **${hours} giờ ${minutes} phút** nữa nhé.`);
        }

        // Thực hiện cộng tiền
        userData.money += dailyAmount;
        userData.lastDaily = Date.now();
        await userData.save();

        const embed = new EmbedBuilder()
            .setTitle('🎁 QUÀ TẶNG HÀNG NGÀY')
            .setDescription(`Chúc mừng **${message.author.username}**! Bạn đã nhận được **${dailyAmount.toLocaleString()} xu** lương ngày hôm nay.`)
            .setColor(0x00ff7f)
            .setFooter({ text: 'Hãy quay lại vào ngày mai để nhận tiếp!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};