const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'weather',
    description: 'Xem thời tiết các tỉnh thành',
    async execute(message, args, log) {
        const city = args.join(" ") || "Hanoi";
        try {
            const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=vi&format=json`);
            if (!geoRes.data.results) return message.reply("❌ Không tìm thấy địa điểm này!");

            const { latitude, longitude, name, country } = geoRes.data.results[0];

            const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);

            const data = weatherRes.data.current;
            const weatherMap = {
                0: ["☀️", "Trời trong xanh"], 1: ["🌤️", "Ít mây"], 2: ["⛅", "Mây rải rác"], 3: ["☁️", "Nhiều mây"],
                45: ["🌫️", "Sương mù"], 48: ["🌫️", "Sương mù đóng băng"], 51: ["🌦️", "Mưa phùn nhẹ"],
                61: ["🌧️", "Mưa nhỏ"], 95: ["⛈️", "Dông bão"]
            };

            const [emoji, desc] = weatherMap[data.weather_code] || ["🌡️", "Bình thường"];

            const embed = new EmbedBuilder()
                .setColor(data.temperature_2m > 30 ? '#FF4500' : '#00BFFF')
                .setTitle(`${emoji} Thời Tiết: ${name}, ${country}`)
                .addFields(
                    { name: '🌡️ Nhiệt độ', value: `**${data.temperature_2m}°C**`, inline: true },
                    { name: '💧 Độ ẩm', value: `**${data.relative_humidity_2m}%**`, inline: true },
                    { name: '🌬️ Gió', value: `**${data.wind_speed_10m} km/h**`, inline: true },
                    { name: '📝 Trạng thái', value: `**${desc}**`, inline: false }
                )
                .setFooter({ text: `Yêu cầu bởi ${message.author.username}` })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (e) {
            if (log) log(`Lỗi Weather Command: ${e.message}`, "ERR");
            message.reply("❌ Lỗi khi lấy dữ liệu thời tiết!");
        }
    }
};