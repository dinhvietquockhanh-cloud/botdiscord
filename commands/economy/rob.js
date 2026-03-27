const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User'); 

module.exports = {
    name: 'rob',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) return message.reply('💀 Tag người cần cướp đê! Ví dụ: `!rob @user`');
        if (target.id === message.author.id) return message.reply('💀 Đừng tự móc túi mình chứ!');

        let user = await User.findOne({ userId: message.author.id });
        let victim = await User.findOne({ userId: target.id });

        if (!victim || victim.money < 500) return message.reply('💀 Thằng này nghèo quá, cướp làm gì phí công!');
        if (user.money < 200) return message.reply('💀 Bạn cần ít nhất 200$ trong túi để làm "lệ phí" đi ăn trộm!');

       
        const success = Math.random() < 0.4;
        const reward = Math.floor(Math.random() * (victim.money * 0.3)) + 100; 
        const penalty = 500; 

        if (success) {
            user.money += reward;
            victim.money -= reward;
            await user.save();
            await victim.save();

            const winEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🥷 VỤ TRỘM THÀNH CÔNG!')
                .setDescription(`Bạn đã lẻn vào nhà **${target.user.username}** và cuỗm mất **${reward}$**!`)
                .setFooter({ text: 'Nghề này hái ra tiền đấy!' });
            message.channel.send({ embeds: [winEmbed] });
        } else {
            user.money -= penalty;
            await user.save();

            const loseEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('👮 BỊ CẢNH SÁT BẮT!')
                .setDescription(`Bạn bị **${target.user.username}** phát hiện và báo cảnh sát. Bạn bị phạt **${penalty}$**!`)
                .setFooter({ text: 'Đi đêm lắm có ngày gặp ma...' });
            message.channel.send({ embeds: [loseEmbed] });
        }
    },
};