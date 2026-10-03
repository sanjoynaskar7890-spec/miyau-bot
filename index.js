const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Render ke boka bananor jonno dummy server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('AI Bot is running perfectly!');
});
server.listen(process.env.PORT || 3000);

// Discord Client Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Gemini AI Setup (Render theke API key nebe)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

client.on('ready', () => {
  console.log(`AI Bot online hoye geche: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Bot ke mention korle tobei uttor debe
  if (message.mentions.has(client.user)) {
    // User-er message theke bot-er tag ta soriye newa
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!userMessage) {
      return message.reply("Bhai, khali mention keno korchis? Kichu toh bol!");
    }

    try {
      // Discord-e 'typing...' dekhabe
      await message.channel.sendTyping();

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Bot ke or character bujhiye dewa
      const botPersonality = `You are a highly sarcastic, funny Discord bot named Miyau GopGop. You act like a pro gamer who loves playing Free Fire MAX and Roblox. Reply in a mix of Hinglish and Banglish. Keep your answers short (1-3 sentences). Roast the user a little bit for their question, but make sure to actually answer what they asked correctly. User's prompt: ${userMessage}`;

      const result = await model.generateContent(botPersonality);
      const response = await result.response.text();

      message.reply(response);
    } catch (error) {
      console.error(error);
      message.reply("Uff, amar matha ghurche! Ektu pore abar try kar (API Error).");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
