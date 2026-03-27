const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hack',
    description: 'Giả lập quá trình hack chuyên nghiệp và gửi tin nhắn riêng (Troll).',
    async execute(message, args, log) {
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply("⚠️ **HỆ THỐNG:** Ngươi muốn hack ai? Hãy tag tên kẻ đó (Ví dụ: !hack @user)!");
        }

        if (target.bot) return message.reply("❌ **LỖI:** Không thể xâm nhập thực thể trí tuệ nhân tạo!");

        await message.reply({ 
            content: `\`\`\`ansi\n[31m[!] INITIATING MALWARE INJECTION...[0m\n[37mMục tiêu: ${target.username}\nTrạng thái: Đang gửi gói tin khai thác tới DM...[0m\`\`\`` 
        });

        const dmHackEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚠️ CRITICAL SYSTEM BREACH DETECTED')
            .setAuthor({ name: 'UNKNOWN HACKER GROUP', iconURL: 'https://i.imgur.com/Rre65vL.gif' })
            .setDescription(`\`\`\`ansi\n[31m[DANGER][0m Thiết bị của ngươi đã bị đánh dấu bởi Giao thức DVQK4\n[90m----------------------------------------[0m\n[37m- Status:[0m [31mXâm nhập trái phép[0m\n[37m- Trace:[0m [33mĐang quét bộ nhớ đệm...[0m\n\`\`\``)
            .setThumbnail('https://i.imgur.com/Rre65vL.gif')
            .setFooter({ text: 'Unauthorized access detected. System lockdown imminent.' });

        try {
            const dmMsg = await target.send({ embeds: [dmHackEmbed] });

            const steps = [
                `[34m[NETWORK][0m Tìm thấy IP: [37m${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.1[0m`,
                `[33m[SECURITY][0m Firewall: [31mBypassed[0m [▓▓▓▓░░░░░░] 40%`,
                `[32m[DECRYPT][0m Pass: [37m****${Math.random().toString(36).substring(7)}****[0m`,
                `[35m[DATA][0m Đang trích xuất Token & Cookie... [▓▓▓▓▓▓░░░░] 65%`,
                `[36m[ROOT][0m Cài đặt Backdoor thành công tại [37m/sys/kernel/[0m`,
                `[31m[EXFIL][0m Đang tải lên 1.4GB dữ liệu nhạy cảm... [▓▓▓▓▓▓▓▓▓░] 90%`,
                `[1;31m[FATAL] GIAO THỨC TỰ HỦY ĐÃ ĐƯỢC KÍCH HOẠT.[0m`
            ];

            let currentDesc = dmHackEmbed.data.description;

            for (const step of steps) {
                const randomDelay = Math.floor(Math.random() * 1000) + 1500;
                await new Promise(r => setTimeout(r, randomDelay));

                currentDesc += `\n\`\`\`ansi\n${step}\n\`\`\``;
                const updatedEmbed = EmbedBuilder.from(dmHackEmbed).setDescription(currentDesc);
                await dmMsg.edit({ embeds: [updatedEmbed] }).catch(() => null);
            }

            await target.send("💀 **GAME OVER.** Mọi thông tin, hình ảnh và lịch sử trình duyệt của ngươi đã nằm trong tay chúng ta. Đừng cố gắng liên lạc với Support, mọi cổng kết nối đã bị khóa.");

            await new Promise(r => setTimeout(r, 7000));
            await target.send("🤫 *Đùa chút thôi bạn hiền! Bạn vừa bị ăn cú lừa từ **" + message.author.username + "**. Không có gì bị mất đâu, vui vẻ nhé!*");

            const channelEmbed = new EmbedBuilder()
                .setColor('#1abc9c')
                .setTitle('🎯 MISSION ACCOMPLISHED')
                .setDescription(`\`\`\`ansi\n[32m[SUCCESS][0m Đã gieo rắc nỗi kinh hoàng cho **${target.username}**\n[34m[LOG][0m Phiên làm việc kết thúc an toàn.[0m\`\`\``)
                .setFooter({ text: `Thực thi bởi Operator: ${message.author.username}` });

            await message.channel.send({ embeds: [channelEmbed] });

            if (log) log(`HACK-DM PRO: ${message.author.tag} đã troll ${target.tag}`, "CMD");

        } catch (error) {
            await message.channel.send(`❌ **THẤT BẠI:** Mục tiêu **${target.username}** có hàng phòng thủ DM quá mạnh (Hắn đã chặn DM/Người lạ).`);
            if (log) log(`Lỗi HACK-DM PRO: Không thể nhắn tin cho ${target.tag}`, "ERR");
        }
    }
};