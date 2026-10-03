const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('AI Bot is running perfectly!');
});
server.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

client.on('ready', () => {
  console.log(`Bot is online as: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();

    // --- স্পেশাল চেকিং কমান্ড ---
    if (userMessage.toLowerCase() === "check") {
        try {
            await message.reply("Ruk bhai, main check kar raha hu Google API me kya gadbad hai...");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            const data = await response.json();
            
            if (data.models) {
                let modelNames = data.models.map(m => m.name.replace('models/', '')).filter(m => m.includes('gemini'));
                let replyText = `**🚨 ASLI MODELS MIL GAYE! 🚨**\nTere API key me ye models available hain:\n\`\`\`\n${modelNames.join('\n')}\n\`\`\`\nBhai, inme se koi ek naam mujhe bata de!`;
                return message.reply(replyText);
            } else {
                return message.reply(`❌ API Error Data: \n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
            }
        } catch (err) {
            return message.reply(`❌ Fetch Failed: ${err.message}`);
        }
    }
    // -------------------------

    if (!userMessage) {
      return message.reply("Abe nalle, sirf tag karke kya chhod raha hai? Kuch likh toh le bot ke bacche! 🙄");
    }

    try {
      await message.channel.sendTyping();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const promptText = `You are a sarcastic, highly toxic Discord bot named Miyau GopGop. You act like an arrogant pro gamer who plays Free Fire MAX and Roblox. You MUST reply ONLY in Hinglish. Keep your answers short. Roast the user brutally but answer their question. User question: ${userMessage}`;

      const result = await model.generateContent(promptText);
      const text = await result.response.text();
      message.reply(text);

    } catch (error) {
      message.reply(`Abe noob! Mera ping 999+ chala gaya hai! Tu pehle mujhe **@Miyau GopGop check** likh kar message bhej, phir dekh asli culprit! 💀🔥`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
