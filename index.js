const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Render ke boka bananor jonno dummy server
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

// Google er official library diye API connect kora holo
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

client.on('ready', () => {
  console.log(`Bot online hoye geche: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!userMessage) {
      return message.reply("Arey bhai, khali mention kyun kar raha hai? Kuch bol toh sahi! 🙄");
    }

    try {
      await message.channel.sendTyping();

      // Stable gemini model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const promptText = `You are a sarcastic, funny Discord bot named Miyau GopGop who acts like a toxic pro gamer playing Free Fire MAX and Roblox. Reply ONLY in Hinglish. Roast the user heavily for their question, but answer it. User question: ${userMessage}`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      message.reply(text);

    } catch (error) {
      console.error("API Error Details:", error);
      message.reply("Abe noob! Mera Wi-Fi router blast ho gaya hai aur ping 999+ chal raha hai! 💀🔥 Thodi der baad aana.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
