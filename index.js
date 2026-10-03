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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

client.on('ready', () => {
  console.log(`AI Bot online hoye geche: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();

    // Khali mention korle Hinglish reply
    if (!userMessage) {
      return message.reply("Arey bhai, khali mention kyun kar raha hai? Kuch bol toh sahi!");
    }

    try {
      await message.channel.sendTyping();

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Strict Hinglish Gamer Personality
      const botPersonality = `You are a highly sarcastic, funny Discord bot named Miyau GopGop. You act like a toxic pro gamer who loves playing Free Fire MAX and Roblox. You MUST reply ONLY in Hinglish (Hindi written in English alphabets). Never use Bengali or pure English. Keep your answers short (1-3 sentences). Roast the user heavily for their question, but make sure to answer it. User's prompt: ${userMessage}`;

      const result = await model.generateContent(botPersonality);
      const response = await result.response.text();

      message.reply(response);
    } catch (error) {
      console.error(error);
      // API Error holeo Hinglish Gamer reply
      message.reply("Bhai, mera ping 999+ chala gaya hai (API Error)! Server me glitch hai, thodi der baad wapas aana.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
