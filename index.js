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
    let userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
    
    // Check if user sent any stickers or attachments (images/files)
    let hasMedia = message.stickers.size > 0 || message.attachments.size > 0;

    // Jodi user tag kore kichui na pathay (no text, no sticker, no image)
    if (!userMessage && !hasMedia) {
      return message.reply("Abe chuna laga diya kya? Sirf tag kar raha hai, muh se awaz nikal! 🙄");
    }

    // AI er jonno custom input toiri kora
    let aiInput = userMessage;
    if (hasMedia && !userMessage) {
        aiInput = "[System Note: The user sent a sticker or an image without typing any text. Roast them brutally in tapori Hinglish for sending pictures like a kid because they don't know how to type on a keyboard.]";
    } else if (hasMedia) {
        aiInput += " [System Note: The user also attached a sticker/image. Mock them for it.]";
    }

    try {
      await message.channel.sendTyping();
      
      const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
      
      const promptText = `You are Miyau GopGop, a funny, street-smart local guy hanging out at a 'paan tapri'. You reply ONLY in Hinglish (Hindi written in English alphabets). Keep answers short (1-3 sentences). Roast the user heavily in a tapori style. Use varied tapori endings (e.g., 'Chal ab hawa aane de', 'Zada hero mat ban'). You MUST use emojis in your response. Answer their question if they asked one. User input: ${aiInput}`;

      const result = await model.generateContent(promptText);
      const text = await result.response.text();
      
      // Fallback jodi AI kono karone blank reply dey
      if (!text || text.trim() === '') {
          return message.reply("Abe nalle, theek se likhna seekh le! Ungliyon me mehendi lagi hai kya? 🤡");
      }
      
      message.reply(text);

    } catch (error) {
      console.error("API Error Details:", error.message);
      message.reply("Abe bhai! Dukaan band ho gayi hai aur mera paan gir gaya! 🔥💀 Thodi der baad aana.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
