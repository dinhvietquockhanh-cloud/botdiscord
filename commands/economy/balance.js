const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'vi',
    async execute(message, args) {
        const userData = await User.findOne({ userId: message.author.id });
        if (!userData) return message.reply("✨ Bạn chưa có tài khoản, hãy thử dùng lệnh `!dao` trước!");

        const embed = {
            color: 0x0099ff,
            title: `Ví tiền của ${message.author.username}`,
            fields: [
                { name: '💰 Tiền mặt', value: `${userData.money.toLocaleString()} xu`, inline: true },
                { name: '💎 Kim cương', value: `${userData.diamonds.toLocaleString()} viên`, inline: true },
                { name: '🏦 Ngân hàng', value: `${userData.bank.toLocaleString()} xu`, inline: true },
            ],
            thumbnail: { url: message.author.displayAvatarURL() }
        };

        message.reply({ embeds: [embed] });
    }
};