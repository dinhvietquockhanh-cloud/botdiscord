const User = require('../../models/User'); 

module.exports = {
    name: 'baucua',
    async execute(message, args) {
        
        const linhVatMapping = {
            'bau': '🎃',
            'cua': '🦀',
            'tom': '🦐',
            'ca': '🐟',
            'ga': '🐓',
            'nai': '🦌'
        };

        const icons = Object.values(linhVatMapping);
        const luaChon = args[0]?.toLowerCase(); 
        const tienCuoc = parseInt(args[1]);

        
        if (!luaChon || !linhVatMapping[luaChon] || isNaN(tienCuoc) || tienCuoc <= 0) {
            return message.reply('💀 Cú pháp: `!baucua [ten con] [số tiền]`\nVD: `!baucua cua 1000` (Tên: bau, cua, tom, ca, ga, nai)');
        }

        try {
            
            let userData = await User.findOne({ userId: message.author.id });
            if (!userData || userData.money < tienCuoc) {
                return message.reply('💸 Bạn không đủ tiền! Lo đi làm thêm đi.');
            }

            
            userData.money -= tienCuoc;
            await userData.save();

            const iconCuoc = linhVatMapping[luaChon];
            const msg = await message.channel.send(`🎰 **${message.author.username}** đã đặt **${tienCuoc}** vào **${luaChon.toUpperCase()}** ${iconCuoc}...`);

            
            for (let i = 0; i < 3; i++) {
                await new Promise(res => setTimeout(res, 800));
                const xoay = () => icons[Math.floor(Math.random() * icons.length)];
                await msg.edit(`🎰 [ ${xoay()} | ${xoay()} | ${xoay()} ] 🎰 đang lắc...`);
            }

            
            const kq1 = icons[Math.floor(Math.random() * icons.length)];
            const kq2 = icons[Math.floor(Math.random() * icons.length)];
            const kq3 = icons[Math.floor(Math.random() * icons.length)];
            const ketQua = [kq1, kq2, kq3];

            const soLanTrung = ketQua.filter(x => x === iconCuoc).length;
            let thongBao = `🎰 Kết quả: **${kq1} | ${kq2} | ${kq3}**\n`;

            if (soLanTrung > 0) {
                const tienThang = tienCuoc * (soLanTrung + 1); 
                userData.money += tienThang;
                await userData.save();
                thongBao += `🎉 Đỉnh quá! Trúng **${soLanTrung}** con **${luaChon.toUpperCase()}**! Bạn nhận được **${tienThang}**!`;
            } else {
                thongBao += `💸 Rất tiếc, không có con **${luaChon.toUpperCase()}** nào cả. Mất sạch **${tienCuoc}**!`;
            }

            await msg.edit(thongBao);

        } catch (error) {
            console.error(error);
            message.reply('💀 Lỗi hệ thống rồi đại ca ơi!');
        }
    },
};