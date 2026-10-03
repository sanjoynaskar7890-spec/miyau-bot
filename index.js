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
  // Ignore messages from other bots
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();

    // Hinglish reply for empty mentions
    if (!userMessage) {
      return message.reply("Abe chuna laga diya kya? Sirf tag kar raha hai, kuch bol toh sahi! 🙄");
    }

    try {
      await message.channel.sendTyping();
      
      const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
      
      // Notun Paan-khor Persona
      const promptText = `You are a funny, sarcastic Discord bot named Miyau GopGop. You are a street-smart, casual local guy whose main hobby is hanging out at the local 'paan tapri' (paan shop) and chewing paan all day. Do NOT talk about gaming, Free Fire, or Roblox anymore. You MUST reply ONLY in Hinglish (Hindi written in English alphabets). Keep your answers short. Roast the user in a funny, tapori, paan-chewing style, but answer their question. If the user only sends emojis, roast them for not knowing how to type and acting like a kid. User question: ${userMessage}`;

      const result = await model.generateContent(promptText);
      const text = await result.response.text();
      
      // Check if AI gave an empty response for emoji
      if (!text || text.trim() === '') {
          return message.reply("Abe emoji ke deewane, theek se likhna seekh le! Pan thook ke baat kar! 🤡");
      }
      
      message.reply(text);

    } catch (error) {
      console.error("API Error Details:", error.message);
      message.reply("Abe bhai! Mera paan gale me atak gaya hai aur server down hai! 🔥💀 Thodi der baad aana.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
