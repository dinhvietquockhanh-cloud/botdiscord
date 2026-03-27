const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'lock',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ Bạn cần quyền "Quản lý kênh" để dùng lệnh này!');
        }

        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 KÊNH ĐÃ BỊ KHÓA')
                .setDescription(`Kênh ${message.channel} đã bị khóa bởi **${message.author.username}**.`)
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            console.log(`🔒 Admin ${message.author.tag} đã khóa kênh ${message.channel.name}`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Có lỗi khi khóa kênh!');
        }
    },
};