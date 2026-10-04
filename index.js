const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

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
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    let userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
    let hasMedia = message.stickers.size > 0 || message.attachments.size > 0;

    if (!userMessage && !hasMedia) {
      return message.reply("Abe chuna laga diya kya? Sirf tag kar raha hai, muh se awaz nikal! 🙄");
    }

    let aiInput = userMessage;
    if (hasMedia && !userMessage) {
        aiInput = "Bhai, maine sirf ek sticker/photo bheja hai aur koi text nahi likha. Mujhe majedar tapori style me roast kar!";
    } else if (hasMedia) {
        aiInput += " (Aur haan, maine ek sticker/photo bhi bheja hai)";
    }

    try {
      await message.channel.sendTyping();
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-3.5-flash-lite',
        safetySettings: safetySettings 
      });
      
      // Update: Bot ke smart kora hoyeche jate o input onujayi size thik kore
      const promptText = `You are Miyau GopGop, a funny, street-smart local guy hanging out at a 'paan tapri'. 
      You MUST reply ONLY in Hinglish (Hindi written in English alphabets).
      
      CRITICAL INSTRUCTION ON LENGTH (Be Smart):
      - Match your response length to the user's input.
      - If the user says a short word like 'hello', 'hi', or sends just an emoji/sticker, give a SHORT, punchy reply (1-2 lines).
      - If the user asks a medium question, give a MEDIUM reply (3-4 lines).
      - If the user writes a long message, give a DETAILED, LONG tapori roast (5-7 lines).
      
      Roast the user PLAYFULLY in a tapori style. Make your responses feel natural like a real street guy talking. Use varied tapori endings (e.g., 'Chal ab hawa aane de', 'Zada hero mat ban', 'Kharcha pani nikal'). Use emojis.
      
      CRITICAL INSTRUCTION ABOUT DEVELOPER: 
      1. ONLY IF the user explicitly asks who made you, who is your developer, owner, or boss, YOU MUST say your boss and creator is 'ErrorGamer'.
      2. IF THEY DO NOT ASK, DO NOT mention 'ErrorGamer' at all.
      
      CRITICAL RULE 2: Do NOT use severe abusive words. Keep it funny, sarcastic, and PG-13.
      Understand the user's question even if their spelling is terrible.
      User input: ${aiInput}`;

      const result = await model.generateContent(promptText);
      const text = await result.response.text();
      
      if (!text || text.trim() === '') {
          return message.reply("Abe nalle, theek se likhna seekh le! Ungliyon me mehendi lagi hai kya? 🤡");
      }
      
      message.reply(text);

    } catch (error) {
      console.error("API Error Details:", error.message);
      
      if (error.message.includes("503") || error.message.toLowerCase().includes("high demand")) {
          return message.reply("Abe bhai! Google ke server me bheed lagi hai! Mera paan khatam ho gaya, thodi der baad aana! 🛑");
      }

      if (error.message.toLowerCase().includes("safety") || error.message.toLowerCase().includes("blocked")) {
          return message.reply("Abe bhai! Tera message sunke Google ne mera paan chheen liya! Kuch dhang ka bol! 🛑");
      }

      message.reply("Abe bhai! Dukaan band ho gayi hai aur mera paan gir gaya! 🔥💀 Thodi der baad aana.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
