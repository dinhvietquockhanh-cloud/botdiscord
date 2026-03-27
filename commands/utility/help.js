const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Hiển thị danh sách lệnh phân loại theo 4 danh mục.',
    async execute(message, args, log) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🛡️ CORE SYSTEM TERMINAL')
            .setAuthor({ 
                name: 'DVQK4 OPERATOR', 
                iconURL: message.client.user.displayAvatarURL() 
            })
            .setDescription('```ansi\n[31m[INFO][0m Truy cập giao thức hỗ trợ... OK\n[90m--------------------------------------[0m\n```')
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '💰 PHẦN 1: ECONOMY (Tài chính)', 
                    value: '`balance`, `bank`, `daily`, `pay`, `profile`, `top`' 
                },
                { 
                    name: '⛏️ PHẦN 2: ACTIONS (Hoạt động)', 
                    value: '`dao`, `lamdi`, `mine`, `rob`, `sell`' 
                },
                { 
                    name: '🎲 PHẦN 3: GAMES (Giải trí)', 
                    value: '`baucua`, `taixiu`, `say`' 
                },
                { 
                    name: '🛠️ PHẦN 4: UTILITY & SYSTEM (Hệ thống)', 
                    value: '`weather`, `crypto`, `avatar`, `check-host`, `help`, `rank`, `report`, `ticket`, `clear`, `restart`' 
                }
            )
            .setFooter({ text: 'DEVICE_ID: DVQK4-SECURE-NODE // Giao thức v3.9.1' })
            .setTimestamp();

        await message.reply({ embeds: [helpEmbed] });

        if (log) {
            log(`${message.author.tag} đã mở Terminal trợ giúp`, "CMD");
        }
    }
};