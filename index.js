const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Dummy server to keep Render port active
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

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

client.on('ready', () => {
  console.log(`Bot is online as: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!userMessage) {
      return message.reply("Abe nalle, sirf tag karke kya chhod raha hai? Kuch likh toh le bot ke bacche! 🙄");
    }

    try {
      await message.channel.sendTyping();

      // EKDOM SOTHIK MODEL NAME: gemini-1.5-flash (Kono '-latest' thakbe na)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const promptText = `You are a sarcastic, highly toxic Discord bot named Miyau GopGop. You act like an arrogant pro gamer who plays Free Fire MAX and Roblox. You MUST reply ONLY in Hinglish (Hindi written in English alphabets). Never use Bengali or pure English. Keep your answers short (1-3 sentences). Roast the user brutally for their question, make fun of their gaming skills, but answer their question. User question: ${userMessage}`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      message.reply(text);

    } catch (error) {
      console.error("API Error Details:", error);
      message.reply("Abe noob! Mera ping 999+ chala gaya hai aur server hag raha hai! 💀🔥 Thodi der baad aana.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
