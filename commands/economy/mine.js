const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'mine',
    async execute(message, args) {
        let user = await User.findOne({ userId: message.author.id });
        if (!user) return message.reply('💀 Bạn chưa có tài khoản! Hãy dùng lệnh !daily trước.');

        
        const cooldown = 60000; 
        if (user.lastMine && Date.now() - user.lastMine < cooldown) {
            const remaining = Math.ceil((cooldown - (Date.now() - user.lastMine)) / 1000);
            return message.reply(`⏳ Máy tính đang quá nhiệt! Thử lại sau **${remaining} giây**.`);
        }

        
        const msg = await message.channel.send('```fix\n[TRUY CẬP HỆ THỐNG...] 0%\n```');

        
        setTimeout(async () => {
            await msg.edit('```fix\n[ĐANG GIẢI MÃ BLOCKCHAIN...] 45%\n```');
            setTimeout(async () => {
                await msg.edit('```fix\n[ĐANG KHAI THÁC BITCOIN...] 90%\n```');

                
                const rate = Math.random();
                let resultEmbed = new EmbedBuilder().setTimestamp();

                
                if (rate < 0.10) {
                    const fine = 1000 * user.pcLevel;
                    user.money = Math.max(0, user.money - fine);
                    resultEmbed.setColor('#FF0000')
                        .setTitle('🚨 BỊ CẢNH SÁT MẠNG TÓM!')
                        .setDescription(`💻 Hệ thống của bạn bị truy vết. Bạn bị phạt **${fine}$** và tịch thu thiết bị tạm thời!`);
                } 
            

                else if (rate < 0.15) {
                    const bigWin = 5000 * user.pcLevel;
                    user.money += bigWin;
                    resultEmbed.setColor('#00FF00')
                        .setTitle('# 💎【 TRÚNG LỚN: BITCOIN 】')
                        .setDescription(`\n**Hệ thống hacker đã khai thác được 1 BTC trị giá ${bigWin}$!**\n`)
                        .setImage('https://cdn.discordapp.com/attachments/1440238187350851687/image_8c9a80.png'); 
                }
                
                else {
                    const normalWin = Math.floor(Math.random() * (200 * user.pcLevel)) + 100;
                    user.money += normalWin;
                    resultEmbed.setColor('#FFFFFF')
                        .setTitle('🖥️ KHAI THÁC THÀNH CÔNG')
                        .setDescription(`Bạn đã đào được **${normalWin}$** từ các giao dịch nhỏ.\n*(Level máy tính hiện tại: ${user.pcLevel})*`);
                }

                user.lastMine = Date.now();
                await user.save();
                await msg.delete(); 
                message.channel.send({ embeds: [resultEmbed] });

            }, 1000);
        }, 1000);
    },
};