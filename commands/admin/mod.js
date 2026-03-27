module.exports = {
    name: 'mod',
    async execute(message, args) {
        const action = args[0]; 
        const target = message.mentions.members.first();

        if (!message.member.permissions.has('Administrator')) return message.reply("❌ Bạn không có quyền Admin!");
        if (!target) return message.reply("❌ Hãy tag người cần xử lý!");

        try {
            if (action === 'kick') {
                await target.kick();
                message.reply(`✅ Đã đá **${target.user.tag}** ra khỏi server.`);
            } else if (action === 'ban') {
                await target.ban();
                message.reply(`🔨 Đã cấm **${target.user.tag}** vĩnh viễn.`);
            } else {
                message.reply("❌ Cách dùng: `!mod kick @user` hoặc `!mod ban @user`.");
            }
        } catch (err) {
            message.reply("❌ Mình không đủ quyền để xử lý người này (họ có thể là Admin/Mod).");
        }
    }
};