const User = require('../../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dao',
    async execute(message, args) {
        let userData = await User.findOne({ userId: message.author.id });
        if (!userData) userData = await User.create({ userId: message.author.id });

        const cooldown = 30000; 
        if (Date.now() - userData.lastMine < cooldown) {
            return message.reply("⛏️ Bạn đang mệt, đợi tí đã!");
        }

        const win = Math.random() > 0.002;
        if (win) {
            const kimcuong = Math.floor(Math.random() * 3) + 1;
            userData.diamonds += kimcuong;
            userData.money += kimcuong * 500;
            userData.lastMine = Date.now();
            await userData.save();
            message.reply(`💎 Chúc mừng! Bạn đào được **${kimcuong} viên kim cương** (Nhận +${kimcuong * 500} xu).`);
        } else {
            userData.lastMine = Date.now();
            await userData.save();
            message.reply("🏜️ Đen quá, đào trúng đá rồi!");
        }
    }
};