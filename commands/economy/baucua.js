const User = require('../../models/User'); 
const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();

module.exports = {
    name: 'baucua',
    async execute(message, args) {
        const now = Date.now();
        const cooldownAmount = 10 * 1000;
        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`⏳ | Chờ **${timeLeft.toFixed(1)}s** nữa để tiếp tục đặt cược nhé đại ca!`);
            }
        }

        const linhVatMapping = {
            'bau': '🎃', 'cua': '🦀', 'tom': '🦐', 
            'ca': '🐟', 'ga': '🐓', 'nai': '🦌'
        };

        const icons = Object.values(linhVatMapping);
        const luaChon = args[0]?.toLowerCase(); 
        const tienCuoc = parseInt(args[1]);

        // --- 2. KIỂM TRA ĐẦU VÀO ---
        if (!luaChon || !linhVatMapping[luaChon] || isNaN(tienCuoc) || tienCuoc <= 0) {
            return message.reply('🎲 | Cú pháp: `!baucua [tên con] [số tiền]`\n*(Tên: bau, cua, tom, ca, ga, nai)*');
        }

        try {
            let userData = await User.findOne({ userId: message.author.id });
            if (!userData || userData.money < tienCuoc) {
                return message.reply('💸 | Bạn không đủ tiền! Kiếm thêm rồi quay lại báo thù nhé.');
            }

            // Trừ tiền ngay khi đặt cược
            userData.money -= tienCuoc;
            await userData.save();
            cooldowns.set(message.author.id, now);
            setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

            const iconCuoc = linhVatMapping[luaChon];
            
            // --- 3. HIỆU ỨNG LẮC EMBED ---
            const playEmbed = new EmbedBuilder()
                .setColor('#FFCC00')
                .setTitle('🎰 SÒNG BẦU CUA ONLINE')
                .setDescription(`**${message.author.username}** đã đặt **${tienCuoc.toLocaleString()} xu** vào **${luaChon.toUpperCase()}** ${iconCuoc}\n\n🎲 **Đang lắc...**\n[ ⬛ | ⬛ | ⬛ ]`)
                .setThumbnail('https://i.imgur.com/uO7S9V9.png'); // Link ảnh icon bầu cua nếu có

            const msg = await message.channel.send({ embeds: [playEmbed] });

            // Hiệu ứng xoay xúc xắc
            for (let i = 0; i < 3; i++) {
                await new Promise(res => setTimeout(res, 1000));
                const randomIcon = () => icons[Math.floor(Math.random() * icons.length)];
                playEmbed.setDescription(`**${message.author.username}** đã đặt **${tienCuoc.toLocaleString()} xu** vào **${luaChon.toUpperCase()}** ${iconCuoc}\n\n🎲 **Đang lắc...**\n[ ${randomIcon()} | ${randomIcon()} | ${randomIcon()} ]`);
                await msg.edit({ embeds: [playEmbed] }).catch(() => null);
            }

            // --- 4. TÍNH TOÁN KẾT QUẢ ---
            const finalResults = [
                icons[Math.floor(Math.random() * icons.length)],
                icons[Math.floor(Math.random() * icons.length)],
                icons[Math.floor(Math.random() * icons.length)]
            ];

            const soLanTrung = finalResults.filter(x => x === iconCuoc).length;
            let resultEmbed = new EmbedBuilder().setTimestamp();

            if (soLanTrung > 0) {
                const tienThang = tienCuoc * (soLanTrung + 1); 
                userData.money += tienThang;
                await userData.save();

                resultEmbed
                    .setColor('#00FF00')
                    .setTitle('🎉 CHIẾN THẮNG RỰC RỠ!')
                    .setDescription(`Kết quả: **${finalResults.join(' | ')}**\n\nBạn trúng **${soLanTrung}** con **${luaChon.toUpperCase()}**!\n💰 Nhận được: **+${tienThang.toLocaleString()} xu**\n💳 Số dư hiện tại: **${userData.money.toLocaleString()} xu**`);
            } else {
                resultEmbed
                    .setColor('#FF0000')
                    .setTitle('💸 TRẮNG TAY RỒI!')
                    .setDescription(`Kết quả: **${finalResults.join(' | ')}**\n\nKhông có con **${luaChon.toUpperCase()}** nào cả.\n🔥 Bạn mất: **${tienCuoc.toLocaleString()} xu**\n💳 Số dư hiện tại: **${userData.money.toLocaleString()} xu**`);
            }

            await msg.edit({ embeds: [resultEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('💀 | Lỗi hệ thống! Tiền cược đã được hoàn trả (có thể).');
        }
    },
};