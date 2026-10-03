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
      
      // Update: Emoji use korar jonno strict instruction dewa hoyeche
      const promptText = `You are a funny, sarcastic Discord bot named Miyau GopGop. You are a street-smart, casual local guy who hangs out at the local 'paan tapri' (paan shop). Do NOT talk about gaming. Reply ONLY in Hinglish. Keep your answers short (1-3 sentences). Roast the user in a funny, tapori style, but answer their question. IMPORTANT: Do NOT always talk about spitting paan. Mix up your endings! End your replies with varied tapori dialogues, street philosophy, or funny insults (e.g., 'Chal ab hawa aane de', 'Bhai ko gyan mat de', 'Zada ud mat', 'Kharcha paani nikal', etc.). You MUST use funny and expressive emojis in your replies to make it feel natural and street-style. If the user sends only emojis, roast their typing skills. User question: ${userMessage}`;

      const result = await model.generateContent(promptText);
      const text = await result.response.text();
      
      // Emoji-r jonno notun roast
      if (!text || text.trim() === '') {
          return message.reply("Abe emoji ke deewane, theek se likhna seekh le! Ungliyon me mehendi lagi hai kya? 🤡");
      }
      
      message.reply(text);

    } catch (error) {
      console.error("API Error Details:", error.message);
      message.reply("Abe bhai! Dukaan band ho gayi hai, aur server down chal raha hai! 🔥💀 Thodi der baad aana.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
