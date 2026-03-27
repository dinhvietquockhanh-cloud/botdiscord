const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'crypto',
    description: 'Xem giá thị trường tiền điện tử (BTC, ETH, SOL...)',
    async execute(message, args, log) {
        const coinInput = args[0]?.toLowerCase() || 'bitcoin';

        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinInput}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`);

            const data = response.data;
            const market = data.market_data;

            const change24h = market.price_change_percentage_24h;
            const embedColor = change24h >= 0 ? '#00ff00' : '#ff0000';
            const trendEmoji = change24h >= 0 ? '📈' : '📉';

            const cryptoEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`${data.symbol.toUpperCase()} - ${data.name} ${trendEmoji}`)
                .setThumbnail(data.image.large)
                .addFields(
                    { name: '💰 Giá hiện tại', value: `**$${market.current_price.usd.toLocaleString()}**`, inline: true },
                    { name: '📊 Biến động (24h)', value: `**${change24h.toFixed(2)}%**`, inline: true },
                    { name: '🔝 Cao nhất (24h)', value: `$${market.high_24h.usd.toLocaleString()}`, inline: true },
                    { name: '💎 Vốn hóa', value: `$${market.market_cap.usd.toLocaleString()}`, inline: false },
                    { name: '📉 Thấp nhất (24h)', value: `$${market.low_24h.usd.toLocaleString()}`, inline: true },
                    { name: '🔄 Khối lượng (24h)', value: `$${market.total_volume.usd.toLocaleString()}`, inline: true }
                )
                .setFooter({ text: `Dữ liệu từ CoinGecko | Cập nhật bởi ${message.client.user.username}` })
                .setTimestamp();

            await message.reply({ embeds: [cryptoEmbed] });

            if (log) log(`CRYPTO: ${message.author.tag} tra cứu giá ${data.name}`, "CMD");

        } catch (e) {
            if (e.response && e.response.status === 404) {
                return message.reply("❌ Không tìm thấy đồng Coin này! Hãy nhập tên đầy đủ (vd: bitcoin, ethereum, solana).");
            }
            if (log) log(`Lỗi Crypto: ${e.message}`, "ERR");
            message.reply("⚠️ Có lỗi xảy ra hoặc API đang bận, vui lòng thử lại sau!");
        }
    }
};