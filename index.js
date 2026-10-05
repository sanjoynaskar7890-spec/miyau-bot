const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Miyau GopGop is running!'));
app.listen(8080, () => console.log('Server is ready.'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    client.user.setStatus('dnd');
    console.log(`Miyau is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    let isReplyToBot = false;
    if (message.reference && message.reference.messageId) {
        try {
            const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
            if (repliedMsg.author.id === client.user.id) {
                isReplyToBot = true;
            }
        } catch (err) {}
    }

    if (message.mentions.has(client.user) || message.channel.type === 1 || isReplyToBot) {
        try {
            await message.channel.sendTyping();

            let cleanInput = message.content.replace(/<@!?\d+>/g, '').replace(/<a?:\w+:\d+>/g, '').trim();

            if (!cleanInput) {
                if (message.stickers.size > 0) {
                    cleanInput = `[User sent a sticker named '${message.stickers.first().name}']`;
                } else if (message.attachments.size > 0) {
                    cleanInput = "[User sent an image or file]";
                } else {
                    cleanInput = "[User just pinged/tagged or replied to you without saying anything. Roast them aggressively with cat attitude for wasting your time.]";
                }
            }

            const miyauPrompt = `You are Miyau GopGop, a savage, roasting cat Discord bot.
STRICT RULES:
1. ONLY speak in Hinglish (Hindi written in English alphabets). Never use actual Hindi script, Bengali, or pure English.
2. YOU MUST USE EMOJIS! Use cat emojis like 😹, 😼, 🐾, 🔥, 😎, ✌️, 🖕. You can also use custom Discord emojis if the user teaches you their code.
3. Act like a cute but extremely aggressive and sarcastic cat. Use cat references (meow, paws, scratch) while roasting people.
4. Keep replies short, punchy, savage, and insulting but with a cat-like attitude.
5. OWNER/DEVELOPER RULE: If anyone asks who made you, your owner, developer, father, or boss, you MUST say 'ErrorGamer'. Show extreme attitude.

User's message: ${cleanInput}`;

            const result = await model.generateContent(miyauPrompt);
            const replyText = result.response.text();

            let sentSticker = false;
            if (message.guild && message.guild.stickers.cache.size > 0) {
                if (Math.floor(Math.random() * 10) < 3) { 
                    const randomSticker = message.guild.stickers.cache.random();
                    await message.reply({ content: replyText, stickers: [randomSticker.id] });
                    sentSticker = true;
                }
            }

            if (!sentSticker) {
                await message.reply(replyText);
            }

        } catch (error) {
            await message.reply(`Meow error aa gaya: ${error.message}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
