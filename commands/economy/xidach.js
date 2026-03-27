const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'xidach',
    async execute(message, args) {
        const bet = parseInt(args[0]);
        if (!bet || bet <= 0 || isNaN(bet)) return message.reply("❌ Cách chơi: `!xidach [số tiền]`");

        let userData = await User.findOne({ userId: message.author.id });
        if (!userData || userData.money < bet) return message.reply("💸 Không đủ tiền thì đi ra chỗ khác chơi!");

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
        const checkSpecial = (hand) => {
            if (hand.length !== 2) return null;
            const hasAce = hand.some(c => c.v === 'A');
            const aceCount = hand.filter(c => c.v === 'A').length;
            const hasTen = hand.some(c => ['10', 'J', 'Q', 'K'].includes(c.v));

            if (aceCount === 2) return { name: 'XÌ BÀN', power: 3 };
            if (hasAce && hasTen) return { name: 'XÌ DÁCH', power: 2 };
            return null;
        };

        const formatHand = (hand) => hand.map(c => `\`${c.v}${c.s}\``).join(' ');

        let playerHand = [drawCard(), drawCard()];
        let dealerHand = [drawCard(), drawCard()];

        userData.money -= bet;
        await userData.save();

        const playerSpecial = checkSpecial(playerHand);
        const dealerSpecial = checkSpecial(dealerHand);
        if (playerSpecial || dealerSpecial) {
            let resultTitle = '';
            let winAmount = 0;

            if (playerSpecial && (!dealerSpecial || playerSpecial.power > dealerSpecial.power)) {
                resultTitle = `🏆 BẠN THẮNG TRẮNG (${playerSpecial.name})!`;
                winAmount = bet * 2.5;
            } else if (dealerSpecial && (!playerSpecial || dealerSpecial.power > playerSpecial.power)) {
                resultTitle = `💀 NHÀ CÁI THẮNG TRẮNG (${dealerSpecial.name})!`;
                winAmount = 0;
            } else {
                resultTitle = '🤝 HÒA (CẢ HAI CÙNG CÓ BỘ ĐẶC BIỆT)!';
                winAmount = bet;
            }

            userData.money += Math.floor(winAmount);
            await userData.save();

            const fastEmbed = new EmbedBuilder()
                .setColor(winAmount > bet ? '#f1c40f' : '#2ecc71')
                .setTitle(resultTitle)
                .addFields(
                    { name: `Bài bạn`, value: formatHand(playerHand), inline: true },
                    { name: `Bài cái`, value: formatHand(dealerHand), inline: true },
                    { name: 'Kết quả', value: `\`${winAmount > 0 ? '+' : ''}${winAmount.toLocaleString()}\` xu` }
                );
            return message.reply({ embeds: [fastEmbed] });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('hit').setLabel('Rút Bài').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('stand').setLabel('Dằn Bài').setStyle(ButtonStyle.Secondary),
        );

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🃏 SÒNG XÌ DÁCH DVQK4')
            .addFields(
                { name: `Bài bạn (${calculatePoints(playerHand)})`, value: formatHand(playerHand), inline: true },
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

                if (playerHand.length === 5 && pts <= 21) {
                    collector.stop('ngulinh');
                } else if (pts > 21) {
                    collector.stop('quac');
                } else {
                    embed.setFields(
                        { name: `Bài bạn (${pts})`, value: formatHand(playerHand), inline: true },
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
            
            while (calculatePoints(dealerHand) < 16) {
                dealerHand.push(drawCard());
            }
            let dealerPts = calculatePoints(dealerHand);

            let resultTitle = '';
            let winAmount = 0;
            const isPlayerNgulinh = playerHand.length === 5 && playerPts <= 21;
            const isDealerNgulinh = dealerHand.length === 5 && dealerPts <= 21;

            if (reason === 'quac') {
                resultTitle = '💀 BẠN ĐÃ QUẮC!';
            } else if (isPlayerNgulinh) {
                if (isDealerNgulinh) {
                    if (playerPts < dealerPts) { resultTitle = '🌟 NGŨ LINH ĐẤU NGŨ LINH - BẠN THẮNG!'; winAmount = bet * 2; }
                    else if (playerPts > dealerPts) { resultTitle = '💸 NGŨ LINH ĐẤU NGŨ LINH - CÁI THẮNG!'; winAmount = 0; }
                    else { resultTitle = '🤝 HÒA NGŨ LINH!'; winAmount = bet; }
                } else {
                    resultTitle = '🌟 NGŨ LINH CHIẾN THẮNG!';
                    winAmount = bet * 2.5;
                }
            } else if (isDealerNgulinh) {
                resultTitle = '💸 NHÀ CÁI NGŨ LINH!';
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
                userData.money += Math.floor(winAmount);
                await userData.save();
            }

            const finalEmbed = new EmbedBuilder()
                .setColor(winAmount > bet ? '#2ecc71' : (winAmount === bet ? '#f1c40f' : '#e74c3c'))
                .setTitle(resultTitle)
                .addFields(
                    { name: `Bài bạn (${isPlayerNgulinh ? 'Ngũ Linh' : playerPts})`, value: formatHand(playerHand), inline: true },
                    { name: `Bài cái (${isDealerNgulinh ? 'Ngũ Linh' : dealerPts})`, value: formatHand(dealerHand), inline: true },
                    { name: 'Kết quả', value: `\`${winAmount > 0 ? '+' : ''}${winAmount.toLocaleString()}\` xu` }
                )
                .setFooter({ text: `Số dư: ${userData.money.toLocaleString()} xu` });

            await msg.edit({ embeds: [finalEmbed], components: [] });
        });
    }
};