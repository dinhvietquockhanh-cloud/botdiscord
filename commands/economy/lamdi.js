const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'lamdi',
    async execute(message, args) {
        let user = await User.findOne({ userId: message.author.id });
        if (!user) return message.reply('💀 Bạn chưa có hồ sơ! Hãy dùng lệnh !daily trước.');

        
        const cooldown = 30000; 
        if (user.lastWork && Date.now() - user.lastWork < cooldown) {
            const remaining = Math.ceil((cooldown - (Date.now() - user.lastWork)) / 1000);
            return message.reply(`⏳ Vừa đi khách xong, nghỉ ngơi tí đê! Thử lại sau **${remaining} giây**.`);
        }

        const rate = Math.random();
        let resultEmbed = new EmbedBuilder().setTimestamp();

        
        if (rate < 0.20) {
            const fine = 500;
            user.money = Math.max(0, user.money - fine);
            resultEmbed.setColor('#FF0000')
                .setTitle('👮 CÔNG AN ĐI TUẦN!')
                .setDescription(`⚠️ Đen thôi đỏ quên đi! Bạn bị hốt khi đang "đứng đường" và bị phạt **${fine}$**.\n*(Nhớ đóng tiền phạt đầy đủ nhé!)*`)
                .setThumbnail('https://i.imgur.com/8f5N3pB.png'); 
        } 
        
        else {
            const jobs = [
                'đi khách đại gia', 
                'phục vụ quán bar', 
                'múa cột trong club', 
                'tiếp khách VIP'
            ];
            const job = jobs[Math.floor(Math.random() * jobs.length)];
            const salary = Math.floor(Math.random() * 400) + 200; 

            user.money += salary;
            resultEmbed.setColor('#FF69B4') 
                .setTitle('💖 KHÁCH HÀNG HÀI LÒNG!')
                .setDescription(`Bạn vừa **${job}** và được bo **${salary}$**.\n\n> *Số dư hiện tại: **${user.money}$***`)
                .setFooter({ text: 'Làm ăn lương thiện (gần như thế)...' });
        }

        user.lastWork = Date.now();
        await user.save();

        message.channel.send({ embeds: [resultEmbed] });
    },
};