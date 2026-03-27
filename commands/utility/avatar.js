const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    async execute(message, args) {
        
        const user = message.mentions.users.first() || message.author;

        
        const avatarEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Hình đại diện của ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setTimestamp()
            .setFooter({ text: `Yêu cầu bởi ${message.author.username}` });

        await message.reply({ embeds: [avatarEmbed] });
    },
};