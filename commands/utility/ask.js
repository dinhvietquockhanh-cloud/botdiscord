const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnectionStatus, 
    entersState,
    StreamType 
} = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

module.exports = {
    name: 'ask',
    description: 'Bot nói giọng chị Google trong phòng voice (Bản Fix lỗi Python)',
    async execute(message, args, log) {
        const text = args.join(" ");
        if (!text) return message.reply("⚠️ Nhập nội dung cần nói!");
        if (text.length > 200) return message.reply("⚠️ Nội dung quá dài (Tối đa 200 ký tự)!");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("⚠️ Ông giáo vào phòng voice trước đã!");

        try {
            const url = googleTTS.getAudioUrl(text, {
                lang: 'vi',
                slow: false,
                host: 'https://translate.google.com',
            });

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 15_000);

            const player = createAudioPlayer();

            const resource = createAudioResource(url, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true
            });

            if (resource.volume) resource.volume.setVolume(0.8);

            connection.subscribe(player);
            player.play(resource);

            if (log) log(`TTS CHỊ GOOGLE: "${text}"`, "CMD");

            player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => {
                    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                        connection.destroy();
                    }
                }, 2000);
            });

            player.on('error', error => {
                if (log) log(`AUDIO_ERROR: ${error.message}`, "ERR");
                connection.destroy();
            });

        } catch (e) {
            if (log) log(`FATAL_VOICE: ${e.message}`, "ERR");
            message.reply("❌ Lỗi! Hãy chắc chắn ông đã chạy lệnh: `npm install opusscript ffmpeg-static` trong Shell.");
        }
    }
};