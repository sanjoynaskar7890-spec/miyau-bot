const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Miyau GopGop is running!'));
// Render er port auto-detect korbe
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server is ready on port ${port}.`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Auto-detector function for Google Gemini Model
let WORKING_MODEL = null;

async function getWorkingModel(apiKey) {
    if (WORKING_MODEL) return WORKING_MODEL;
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            const available = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name);
            
            let flash = available.find(m => m.includes('1.5-flash'));
            if (flash) { WORKING_MODEL = flash; return flash; }
            
            let pro = available.find(m => m.includes('gemini-pro') || m.includes('1.0-pro'));
            if (pro) { WORKING_MODEL = pro; return pro; }
            
            if (available.length > 0) { WORKING_MODEL = available[0]; return WORKING_MODEL; }
        }
    } catch (err) {
        console.error("Model fetch error:", err);
    }
    return "models/gemini-1.5-flash"; // Fallback
}

const miyauPrompt = `Tu Miyau GopGop hai, ek cute par bohot hi savage, roasting cat Discord bot.
STRICT RULES:
1. SIRF aur SIRF Hinglish (English alphabet mein Hindi) mein baat karni hai. Pure English ya Bengali use mat karna.
2. EMOJIS COMPULSORY HAIN! Cat emojis aur attitude wale emojis use kar jaise: 😹, 😼, 🐾, 🔥, 😎, ✌️, 🖕.
3. Tera attitude ek nakhrewali par khatarnak billi jaisa hona chahiye. Meow, paws, scratch aise words use kar insult karte waqt.
4. Reply chhota, punchy, savage, aur direct hona chahiye.
5. OWNER/DEVELOPER RULE: Agar koi puche ki tujhe kisne banaya, tera owner ya baap kaun hai, toh attitude mein bol 'ErrorGamer'.

USER'S MESSAGE TO ROAST: `;

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
        await message.channel.sendTyping();
        try {
            let cleanInput = message.content.replace(/<@!?\d+>/g, '').replace(/<a?:\w+:\d+>/g, '').trim();

            if (!cleanInput) {
                if (message.stickers.size > 0) {
                    cleanInput = `[User ne ek sticker bheja hai jiska naam hai '${message.stickers.first().name}']`;
                } else if (message.attachments.size > 0) {
                    cleanInput = "[User ne ek photo ya file bheji hai]";
                } else {
                    cleanInput = "[User ne bina kuch bole ping/tag kiya hai. Apna time waste karne ke liye billi ban ke usko aggressively roast kar.]";
                }
            }

            const finalInput = miyauPrompt + cleanInput;
            const apiKey = process.env.GEMINI_API_KEY;
            
            // Auto-detect the right model
            const modelName = await getWorkingModel(apiKey);
            
            const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: finalInput }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                const replyText = data.candidates[0].content.parts[0].text;
                
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
            } else {
                const errText = await res.text();
                await message.reply(`Meow API Error aa gaya! Google ne bola:\n\`\`\`${errText.substring(0, 400)}\`\`\`\n(Auto-selected model: ${modelName})`);
            }

        } catch (e) {
            await message.reply(`Meow error aa gaya code mein: ${e.message}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
