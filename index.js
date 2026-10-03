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

// Bot start holei prothome Google ke jera korbe
client.on('ready', async () => {
  console.log(`Bot is online as: ${client.user.tag}`);
  
  console.log("🔍 Checking available models for your API Key...");
  try {
    // Direct Google API theke model list fetch kora hocche
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log("==========================================");
    console.log("🚨 ASOL CULPRIT DHORA PORECHHE! 🚨");
    console.log("Tomar API Key te ei model gulo available:");
    if (data.models) {
      data.models.forEach(model => console.log("-> " + model.name));
    } else {
      console.log("❌ Error API Data:", JSON.stringify(data));
    }
    console.log("==========================================");
  } catch (err) {
    console.log("Fetch error:", err);
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!userMessage) {
      return message.reply("Abe nalle, sirf tag karke kya chhod raha hai? Kuch likh toh le bot ke bacche! 🙄");
    }

    try {
      await message.channel.sendTyping();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const promptText = `You are a sarcastic, highly toxic Discord bot named Miyau GopGop. You act like an arrogant pro gamer who plays Free Fire MAX and Roblox. Reply ONLY in Hinglish. Roast the user brutally but answer their question. User question: ${userMessage}`;

      const result = await model.generateContent(promptText);
      const text = await result.response.text();
      message.reply(text);

    } catch (error) {
      console.error("API Error Details:", error.message);
      message.reply("Abe noob! Mera ping 999+ chala gaya hai! Render ke 'Logs' check kar waha asli culprit pakda gaya hai! 💀🔥");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
