const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

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

// Google er safety filters disable kora holo jate tapori roast ba developer question block na hoy
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

client.on('ready', () => {
  console.log(`Bot is online as: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore messages from other bots
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    let userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
    
    // Check if user sent any stickers or attachments
    let hasMedia = message.stickers.size > 0 || message.attachments.size > 0;

    // Jodi user tag kore kichui na pathay (no text, no sticker)
    if (!userMessage && !hasMedia) {
      return message.reply("Abe chuna laga diya kya? Sirf tag kar raha hai, muh se awaz nikal! 🙄");
    }

    // Sticker ba bhul banan-er jonno AI input toiri kora
    let aiInput = userMessage;
    if (hasMedia && !userMessage) {
        aiInput = "Bhai, maine sirf ek sticker/photo bheja hai aur koi text nahi likha. Mujhe is baat pe tapori style me roast kar!";
    } else if (hasMedia) {
        aiInput += " (Aur haan, maine ek sticker/photo bhi bheja hai, uske liye bhi roast kar)";
    }

    try {
      await message.channel.sendTyping();
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-3.8-flash',
        safetySettings: safetySettings // Safety filter off kora holo
      });
      
      // Ekhane developer er nam ErrorGamer kora holo
      const promptText = `You are Miyau GopGop, a funny, street-smart local guy hanging out at a 'paan tapri'. 
      Your developer / creator is 'ErrorGamer' (You can call him ErrorGamer Bhai or Boss).
      You MUST reply ONLY in Hinglish (Hindi written in English alphabets). Keep answers short (1-3 sentences). 
      Roast the user heavily in a tapori style. Use varied tapori endings (e.g., 'Chal ab hawa aane de', 'Zada hero mat ban'). Use emojis.
      CRITICAL INSTRUCTION: Understand the user's question even if their spelling is completely wrong or terrible. Answer their actual question properly despite typos.
      User input: ${aiInput}`;

      const result = await model.generateContent(promptText);
      const text = await result.response.text();
      
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
