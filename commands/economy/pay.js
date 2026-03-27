const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pay',
    async execute(message, args) {
        const target = message.mentions.members.first();
        const amount = parseInt(args[1]);

   
        if (!target) return message.reply("❌ Bạn muốn chuyển tiền cho ai? Hãy tag người đó (Ví dụ: !pay @User 1000)");
        if (target.id === message.author.id) return message.reply("❌ Bạn không thể tự chuyển tiền cho chính mình!");
        if (target.user.bot) return message.reply("❌ Bot không cần tiền đâu, hãy giữ lấy mà dùng!");
        if (!amount || amount <= 0 || isNaN(amount)) return message.reply("❌ Vui lòng nhập số tiền hợp lệ!");


        let senderData = await User.findOne({ userId: message.author.id });
        if (!senderData || senderData.money < amount) {
            return message.reply(`❌ Bạn không đủ tiền mặt! (Bạn đang có: **${senderData?.money.toLocaleString() || 0} xu**)`);
        }


        let receiverData = await User.findOne({ userId: target.id });
        if (!receiverData) {
            receiverData = await User.create({ userId: target.id });
        }


        senderData.money -= amount;
        receiverData.money += amount;

        await senderData.save();
        await receiverData.save();


        const embed = {
            color: 0x00ff00,
            title: '💸 Giao dịch thành công',
            description: `**${message.author.username}** đã chuyển **${amount.toLocaleString()} xu** cho **${target.user.username}**!`,
            timestamp: new Date(),
        };

        message.reply({ embeds: [embed] });
    }
};