const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'setup-role',
    description: 'Thiết lập bảng chọn vai trò Game tự động.',
    async execute(message, args, log) {
        // 1. Kiểm tra quyền Admin
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Ngươi không đủ thẩm quyền để thiết lập hệ thống vai trò!");
        }

        // 2. Định nghĩa danh sách Game và Role ID (Dựa trên danh sách ông gửi)
        // Lưu ý: Discord giới hạn 5 nút trên 1 hàng, nên tôi sẽ chia làm 2 hàng (ActionRows).
        const gameRoles1 = [
            { id: '1179643730035216484', label: 'CS:GO', emoji: '<:csgo:1179637602190626896>' },
            { id: '1179643493715546112', label: 'LMHT', emoji: '<:lmht:1179638120858259456>' },
            { id: '1179643648271458314', label: 'Valorant', emoji: '<:valorant:1179637628040130640>' },
            { id: '1179643966208090112', label: 'PUBG', emoji: '<:pubg:1179638480276553758>' },
            { id: '1179644232571572234', label: 'PUBG Mobile', emoji: '<:pubgm:1179638501411663924>' }
        ];

        const gameRoles2 = [
            { id: '1179647591609286736', label: 'Minecraft', emoji: '<:minecraft:1179637891564056646>' },
            { id: '1373328171340009522', label: 'L4D2', emoji: '<:Left4Dead21:1357644987784761424>' },
            { id: '1373329246424010866', label: 'Khác', emoji: '<:emoji_57:1373327263713464320>' }
        ];

        const embed = new EmbedBuilder()
            .setTitle('🎮 DANH MỤC TRÒ CHƠI')
            .setDescription('Hãy chọn những tựa game mà ngươi đang tham chiến để nhận thông báo và tìm đồng đội trong lãnh địa này.\n\n➜・┈ ・ ・┈ ・ ・┈ ・ ・┈・')
            .setColor('#5865F2')
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: 'Nhấn một lần để nhận, nhấn lại lần nữa để gỡ bỏ.' })
            .setTimestamp();

        // 3. Tạo các hàng nút bấm
        const row1 = new ActionRowBuilder();
        gameRoles1.forEach(game => {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${game.id}`)
                    .setLabel(game.label)
                    .setEmoji(game.emoji)
                    .setStyle(ButtonStyle.Secondary)
            );
        });

        const row2 = new ActionRowBuilder();
        gameRoles2.forEach(game => {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${game.id}`)
                    .setLabel(game.label)
                    .setEmoji(game.emoji)
                    .setStyle(ButtonStyle.Secondary)
            );
        });

        try {
            await message.channel.send({ embeds: [embed], components: [row1, row2] });

            if (message.deletable) await message.delete().catch(() => null);

            if (log) log(`SETUP-GAME-ROLES: ${message.author.tag} đã tạo bảng chọn game`, "SUCCESS");
        } catch (e) {
            log(`Lỗi Setup-Role: ${e.message}`, "ERR");
            message.reply("❌ Có lỗi xảy ra khi gửi bảng chọn vai trò! Hãy kiểm tra xem Bot có quyền dùng Emoji từ server khác không.");
        }
    },
};