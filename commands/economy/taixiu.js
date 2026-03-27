const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'taixiu',
    async execute(message, args) {
        const bet = parseInt(args[0]);
        const choice = args[1]?.toLowerCase();

        if (!bet || bet <= 0 || isNaN(bet)) return message.reply("❌ Cách chơi: `!taixiu [tiền] [tai/xiu]`");
        if (choice !== 'tai' && choice !== 'xiu') return message.reply("❌ Bạn chọn 'tai' hay 'xiu'?");

        let userData = await User.findOne({ userId: message.author.id });
        if (!userData || userData.money < bet) return message.reply("❌ Bạn không đủ tiền mặt để cược!");

        // 1. Gửi tin nhắn trạng thái đang lắc
        const loadingMsg = await message.reply("🎲 **Đang lắc xúc xắc...** 🎲\n[ ⬛ ⬛ ⬛ ]");

        // 2. Hiệu ứng lắc
        setTimeout(async () => {
            await loadingMsg.edit("🎲 **Đang lắc xúc xắc...** 🎲\n[ 🎲 ⬛ ⬛ ]").catch(() => null);

            setTimeout(async () => {
                await loadingMsg.edit("🎲 **Đang lắc xúc xắc...** 🎲\n[ 🎲 🎲 ⬛ ]").catch(() => null);

                setTimeout(async () => {
                    // 3. Tính toán kết quả
                    const d1 = Math.floor(Math.random() * 6) + 1;
                    const d2 = Math.floor(Math.random() * 6) + 1;
                    const d3 = Math.floor(Math.random() * 6) + 1;
                    const total = d1 + d2 + d3;
                    const result = total >= 11 ? 'tai' : 'xiu';

                    const diceEmojis = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };

                    let finalMsg = `🎲 **Kết quả:** ${diceEmojis[d1]} ${diceEmojis[d2]} ${diceEmojis[d3]} (Tổng: **${total}**) - **${result.toUpperCase()}**\n`;

                    if (choice === result) {
                        userData.money += bet;
                        finalMsg += `🎉 Chúc mừng **${message.author.username}**, bạn thắng **${bet.toLocaleString()} xu**!`;
                    } else {
                        userData.money -= bet;
                        finalMsg += `💸 Rất tiếc, bạn đã mất **${bet.toLocaleString()} xu**.`;
                    }

                    await userData.save();
                    // 4. Hiện kết quả cuối cùng
                    await loadingMsg.edit(finalMsg).catch(() => null);

                }, 1000);
            }, 1000);
        }, 1000);
    }
};