const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'restart',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply("```ansi\n[31m[!] ACCESS DENIED[0m\n```");
        }

        const msg = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setTitle('🔴 CORE REBOOT')
                    .setDescription('```ansi\n[31m[WARNING] Đang ngắt nguồn...[0m\n```')
            ]
        });

        setTimeout(async () => {
            await msg.edit({ content: '`[ SYSTEM_DELETED ]`', embeds: [] }).catch(() => null);
            setTimeout(() => process.exit(), 1000);
        }, 2000);
    }
};