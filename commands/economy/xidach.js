const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'xidach',
    async execute(message, args) {
        const bet = parseInt(args[0]);
        if (!bet || bet <= 0 || isNaN(bet)) return message.reply("❌ Cách chơi: `!xidach [số tiền]`");

        let userData = await User.findOne({ userId: message.author.id });
        if (!userData || userData.money < bet) return message.reply("💸 Không đủ tiền thì đi ra chỗ khác chơi!");

        // Tạo bộ bài
        const suits = ['♠️', '♣️', '♥️', '♦️'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        let deck = [];
        for (const s of suits) {
            for (const v of values) {
                deck.push({ s, v });
            }
        }

        const drawCard = () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
        
        const calculatePoints = (hand) => {
            let pts = 0;
            let aces = 0;
            for (const card of hand) {
                if (card.v === 'A') aces++;
                else if (['J', 'Q', 'K'].includes(card.v)) pts += 10;
                else pts += parseInt(card.v);
            }
            for (let i = 0; i < aces; i++) {
                if (pts + 11 <= 21) pts += 11;
                else pts += 1;
            }
            return pts;
        };

        const formatHand = (hand) => hand.map(c => `\`${c.v}${c.s}\``).join(' ');

        
        let playerHand = [drawCard(), drawCard()];
        let dealerHand = [drawCard(), drawCard()];

        
        userData.money -= bet;
        await userData.save();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('hit').setLabel('Rút Bài').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('stand').setLabel('Dằn Bài').setStyle(ButtonStyle.Secondary),
            );

        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('🃏 SÒNG XÌ DÁCH ONLINE')
            .addFields(
                { name: `Bộ bài của bạn (${calculatePoints(playerHand)})`, value: formatHand(playerHand), inline: true },
                { name: `Nhà cái`, value: `\`${dealerHand[0].v}${dealerHand[0].s}\` ❓`, inline: true }
            )
            .setFooter({ text: `Tiền cược: ${bet.toLocaleString()} xu` });

        const msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'hit') {
                playerHand.push(drawCard());
                const pts = calculatePoints(playerHand);

                if (pts > 21) {
                    collector.stop('quac');
                } else {
                    embed.setFields(
                        { name: `Bộ bài của bạn (${pts})`, value: formatHand(playerHand), inline: true },
                        { name: `Nhà cái`, value: `\`${dealerHand[0].v}${dealerHand[0].s}\` ❓`, inline: true }
                    );
                    await i.update({ embeds: [embed] });
                }
            } else if (i.customId === 'stand') {
                collector.stop('stand');
            }
        });

        collector.on('end', async (collected, reason) => {
            let playerPts = calculatePoints(playerHand);
            let dealerPts = calculatePoints(dealerHand);

            while (dealerPts < 16 && reason === 'stand') {
                dealerHand.push(drawCard());
                dealerPts = calculatePoints(dealerHand);
            }

            let resultTitle = '';
            let winAmount = 0;

            if (playerPts > 21) {
                resultTitle = '💀 BẠN ĐÃ QUẮC (THUA)!';
                winAmount = 0;
            } else if (dealerPts > 21 || playerPts > dealerPts) {
                resultTitle = '🎉 BẠN ĐÃ THẮNG!';
                winAmount = bet * 2;
            } else if (playerPts < dealerPts) {
                resultTitle = '💸 NHÀ CÁI THẮNG!';
                winAmount = 0;
            } else {
                resultTitle = '🤝 HÒA VỐN!';
                winAmount = bet;
            }

            if (winAmount > 0) {
                userData.money += winAmount;
                await userData.save();
            }

            const finalEmbed = new EmbedBuilder()
                .setColor(winAmount > bet ? '#00FF00' : (winAmount === bet ? '#FFFF00' : '#FF0000'))
                .setTitle(resultTitle)
                .addFields(
                    { name: `Bài bạn (${playerPts})`, value: formatHand(playerHand), inline: true },
                    { name: `Bài cái (${dealerPts})`, value: formatHand(dealerHand), inline: true },
                    { name: 'Kết quả', value: winAmount > 0 ? `+${winAmount.toLocaleString()} xu` : `-${bet.toLocaleString()} xu` }
                )
                .setFooter({ text: `Ví hiện tại: ${userData.money.toLocaleString()} xu` });

            await msg.edit({ embeds: [finalEmbed], components: [] });
        });
    }
};