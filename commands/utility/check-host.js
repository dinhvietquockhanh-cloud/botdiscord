const { EmbedBuilder, version } = require('discord.js');
const os = require('os');
const mongoose = require('mongoose');

module.exports = {
    name: 'check-host',
    async execute(message, args) {
        let totalSeconds = (message.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        
        const usage = process.memoryUsage().heapUsed / 1024 / 1024;

        
        const dbStatus = {
            0: "❌ Disconnected",
            1: "✅ Connected",
            2: "⏳ Connecting",
            3: "🔴 Disconnecting"
        };
        const currentDbState = dbStatus[mongoose.connection.readyState] || "❓ Unknown";

        
        const hostEmbed = new EmbedBuilder()
            .setColor('#00ff41') 
            .setTitle('⚡ TERMINAL SYSTEM MONITOR')
            .setAuthor({ name: 'System Administrator', iconURL: message.client.user.displayAvatarURL() })
            .addFields(
                { name: '📡 CONNECTION', value: `\`\`\`yaml\nLatency: ${Math.round(message.client.ws.ping)}ms\nDatabase: ${currentDbState}\`\`\``, inline: false },
                { name: '💻 HOSTING INFO', value: `\`\`\`yaml\nOS: ${os.platform()} ${os.arch()}\nUptime: ${uptime}\nRAM: ${usage.toFixed(2)}MB\`\`\``, inline: false },
                { name: '🤖 BOT ENGINE', value: `\`\`\`yaml\nNode: ${process.version}\nD.js: v${version}\`\`\``, inline: false }
            )
            .setFooter({ text: `Authorized by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [hostEmbed] });
    },
};