const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sell',
    async execute(message, args) {
        const item = args[0]?.toLowerCase();
        let soLuong = args[1];
        const giaKimCuong = 5000; 

        
        if (item !== 'kc' && item !== 'kimcuong') {
            return message.reply('💀 Cú pháp: `!sell kc [số lượng hoặc all]`');
        }

        try {
            let userData = await User.findOne({ userId: message.author.id });

            
            if (!userData) return message.reply('💸 Bạn chưa có viên kim cương nào để bán!');

            
            if (soLuong === 'all') {
                soLuong = userData.diamonds; 
            } else {
                soLuong = parseInt(soLuong);
            }

            
            if (isNaN(soLuong) || soLuong <= 0) {
                return message.reply('💀 Nhập số lượng kim cương muốn bán hợp lệ đi!');
            }

            if (userData.diamonds < soLuong) {
                return message.reply(`💸 Bạn không đủ ${soLuong} kim cương! (Hiện có: ${userData.diamonds})`);
            }

            
            const tongTien = soLuong * giaKimCuong;
            userData.diamonds -= soLuong; 
            userData.money += tongTien;
            await userData.save();

            return message.reply(`✅ Đã bán **${soLuong}** kim cương. Thu về **${tongTien.toLocaleString()}** xu! 💎💰`);

        } catch (error) {
            console.error(error);
            message.reply('💀 Lỗi kho đồ rồi!');
        }
    },
};