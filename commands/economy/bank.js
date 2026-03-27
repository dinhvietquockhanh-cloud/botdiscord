const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bank',
    async execute(message, args) {
        const action = args[0];
        const amount = parseInt(args[1]);

        let userData = await User.findOne({ userId: message.author.id });
        if (!userData) return message.reply("Hãy gõ `!dao` để mở tài khoản trước!");

        if (action === 'gui') {
            if (!amount || amount > userData.money || amount <= 0) return message.reply("Số tiền gửi không hợp lệ hoặc bạn không đủ tiền mặt!");
            userData.money -= amount;
            userData.bank += amount;
            await userData.save();
            return message.reply(`🏦 Đã gửi **${amount.toLocaleString()} xu** vào ngân hàng an toàn!`);
        }

        if (action === 'rut') {
            if (!amount || amount > userData.bank || amount <= 0) return message.reply("Số tiền rút không hợp lệ hoặc ngân hàng không đủ tiền!");
            userData.bank -= amount;
            userData.money += amount;
            await userData.save();
            return message.reply(`🏦 Đã rút **${amount.toLocaleString()} xu** về túi tiền mặt!`);
        }

        message.reply("📝 Cách dùng: `!bank gui [số tiền]` hoặc `!bank rut [số tiền]`");
    }
};