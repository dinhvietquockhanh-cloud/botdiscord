const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();

module.exports = {
    name: 'taixiu',
    async execute(message, args) {
        const now = Date.now();
        const cooldownAmount = 5 * 1000;
        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`⏳ | Bình tĩnh ông ơi, đợi **${timeLeft.toFixed(1)}s** nữa mới lắc tiếp được!`);
            }
        }

        const bet = parseInt(args[0]);
        const choice = args[1]?.toLowerCase();

        if (isNaN(bet) || bet <= 0) return message.reply("❌ | Cách chơi: `!taixiu [số tiền] [tai/xiu]`");
        if (choice !== 'tai' && choice !== 'xiu') return message.reply("❌ | Bạn chọn `tai` hay `xiu` đây?");

        let userData = await User.findOne({ userId: message.author.id });
        if (!userData || userData.money < bet) {
            return message.reply("💸 | Bạn không có đủ tiền mặt để thực hiện cú cược này!");
        }


        cooldowns.set(message.author.id, now);
        setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

        const diceEmojis = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };
        
        const loadingEmbed = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle('🎲 ĐANG LẮC XÚC XẮC...')
            .setDescription('```\n[ ⬛ ⬛ ⬛ ]\n```')
            .setFooter({ text: `Người cược: ${message.author.username} | Mức cược: ${bet.toLocaleString()}` });

        const msg = await message.reply({ embeds: [loadingEmbed] });

        const stages = ['[ 🎲 ⬛ ⬛ ]', '[ 🎲 🎲 ⬛ ]', '[ 🎲 🎲 🎲 ]'];
        for (const stage of stages) {
            await new Promise(res => setTimeout(res, 800));
            loadingEmbed.setDescription(`\`\`\`\n${stage}\n\`\`\``);
            await msg.edit({ embeds: [loadingEmbed] }).catch(() => null);
        }

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2 + d3;
        const result = total >= 11 ? 'tai' : 'xiu';
        const isWin = choice === result;

        if (isWin) {
            userData.money += bet;
        } else {
            userData.money -= bet;
        }
        await userData.save();

        const resultEmbed = new EmbedBuilder()
            .setColor(isWin ? '#00FF00' : '#FF0000')
            .setTitle(isWin ? '🎉 BẠN ĐÃ THẮNG!' : '💀 BẠN ĐÃ THUA!')
            .addFields(
                { name: 'Kết quả', value: `${diceEmojis[d1]} ${diceEmojis[d2]} ${diceEmojis[d3]}`, inline: true },
                { name: 'Tổng điểm', value: `**${total}** (${result.toUpperCase()})`, inline: true },
                { name: 'Số tiền', value: `${isWin ? '+' : '-'}${bet.toLocaleString()} xu`, inline: false },
                { name: 'Ví hiện tại', value: `💰 ${userData.money.toLocaleString()} xu`, inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: 'Cờ bạc người không chơi là người thắng!' })
            .setTimestamp();

        await msg.edit({ embeds: [resultEmbed] }).catch(() => null);
    }
};