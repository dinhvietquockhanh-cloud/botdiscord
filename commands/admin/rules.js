const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rules',
    async execute(message, args) {
        const BANNER_RULES = 'https://images-ext-1.discordapp.net/external/msbBQ2XtzkT6qPqiATXRrZ6S3eiLzauQqg8krmN4o-M/https/media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTdwMzQ2MWx5OTFvZzYyZGxwZDcxbjBuM2tyemRjOWRwZmNlbTFlYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1KVaGr2NKkBtpSrS/giphy.gif'; 
        const rulesEmbed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setAuthor({ 
                name: '━━━━━ 📜 NỘI QUY MÁY CHỦ ━━━━━', 
                iconURL: message.guild.iconURL() 
            })
            .setTitle('# 📑【 ĐIỀU KHOẢN & QUY ĐỊNH 】')
            .setDescription(`\nChào mừng bạn đến với **${message.guild.name}**! Vui lòng đọc kỹ và tuân thủ các điều khoản sau đây để cùng xây dựng cộng đồng văn minh.\n\n---`)
            .addFields(
                { 
                    name: '⚖️ ĐIỀU 1: QUY TẮC CHUNG', 
                    value: '> Mọi thành viên trong SERVER phải tuân theo điều khoản/chính sách sử dụng và quy tắc cộng đồng của Discord.\n> 🔴 **Hình phạt: [Perm Ban không appeal]**' 
                },
                { 
                    name: '🤝 ĐIỀU 2: TÔN TRỌNG LẪN NHAU', 
                    value: '> Mọi thành viên trong server phải tôn trọng lẫn nhau, không gây hấn, tranh cãi trên kênh chat. Nếu muốn tranh cãi xin tự giải quyết riêng qua Direct Message.\n> 🟡 **Hình phạt: [Warning/Ban]**' 
                },
                { 
                    name: '🚫 ĐIỀU 3: CẤM SPAM', 
                    value: '> Spam tin nhắn bị nghiêm cấm ở server này (nhắn liên tục 1 chữ cái/dòng tin nhắn bằng cách copy paste hoặc đập bàn phím), trừ khi được BQT cho phép nhưng khi được yêu cầu dừng lại thì phải dừng lại.\n> 🟠 **Hình phạt: [Warning/Ban/Mute]**' 
                },
                { 
                    name: '💀 ĐIỀU 4: CẤM XÚC PHẠM & THÙ ĐỊCH', 
                    value: '> Mọi hành vi xúc phạm, phân biệt chủng tộc; sử dụng ngôn từ và hình ảnh mang tính thù địch; joke liên quan đến cái chết, tự tử, bệnh tâm lý hoặc tương tự; đe dọa member khác bị nghiêm cấm.\n> 🔴 **Hình phạt: [Warning/Mute/Ban]**' 
                },
                { 
                    name: '🇻🇳 ĐIỀU 5: PHÁP LUẬT & ĐẠO ĐỨC', 
                    value: '> Cấm các hành vi phản động chống phá Nhà nước CHXHCN Việt Nam, quảng cáo/xúi giục hack cheat, đăng tải văn hóa phẩm đồi trụy hoặc lừa đảo.\n> 🚫 **Hình phạt: [Perm Ban]**' 
                }
            )
            .setImage(BANNER_RULES)
            .setFooter({ 
                text: 'Ban Quản Trị có quyền quyết định cuối cùng trong mọi trường hợp!', 
                iconURL: message.guild.iconURL() 
            })
            .setTimestamp();
        await message.channel.send({ embeds: [rulesEmbed] });
        if (message.deletable) {
            await message.delete().catch(() => {});
        }
    },
};