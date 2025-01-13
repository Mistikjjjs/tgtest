const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Replace 'YOUR_BOT_TOKEN' with your actual Telegram bot token from BotFather
const token = '7878507254:AAGZ4i6ZPAnQKqBH4qAO2n-XCMU6Dl5E-Us';
const bot = new TelegramBot(token, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome! Send me a YouTube URL to download the audio.');
});

// Handle YouTube URLs
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Simple URL validation
    if (text.includes('youtube.com') || text.includes('youtu.be')) {
        try {
            // Send "processing" message
            bot.sendMessage(chatId, 'Processing your request...');

            // Make request to the API
            const response = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${text}`);
            
            if (response.data.status === 200) {
                // Get the highest quality version (192kbps)
                const audioData = response.data.data.find(item => item.quality === '192kbps');
                
                if (audioData) {
                    // Send audio information
                    const message = `
🎵 Found: ${audioData.title}
⚡ Quality: ${audioData.quality}
🎧 Format: ${audioData.format}
🔽 Downloading...`;
                    
                    bot.sendMessage(chatId, message);

                    // Download and send the audio file
                    try {
                        const audioResponse = await axios({
                            method: 'GET',
                            url: audioData.downloadUrl,
                            responseType: 'stream'
                        });

                        // Send the audio file
                        bot.sendAudio(chatId, audioResponse.data, {
                            title: audioData.title,
                            caption: `Quality: ${audioData.quality}`
                        });
                    } catch (error) {
                        bot.sendMessage(chatId, '❌ Error downloading the audio file. Please try again later.');
                    }
                }
            }
        } catch (error) {
            bot.sendMessage(chatId, '❌ Error processing your request. Please check the URL and try again.');
            console.error('Error:', error.message);
        }
    } else if (!text.startsWith('/')) {
        bot.sendMessage(chatId, 'Please send a valid YouTube URL.');
    }
});
