const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');

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

      // Sothik Google Gemini API URL (v1beta & gemini-1.5-flash)
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const promptText = `You are a sarcastic, funny Discord bot named Miyau GopGop who acts like a toxic pro gamer playing Free Fire MAX and Roblox. Reply ONLY in Hinglish. Roast the user heavily for their question, but answer it. User question: ${userMessage}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        const replyText = data.candidates[0].content.parts[0].text;
        message.reply(replyText);
      } else {
        console.log("Google API Error Data:", JSON.stringify(data));
        // Error hole ekhane notun emoji-wala dialog asbe
        message.reply("Abe noob! Mera Wi-Fi router blast ho gaya hai aur ping 999+ chal raha hai! 💀🔥 Thodi der baad aana.");
      }

    } catch (error) {
      console.error(error);
      message.reply("Bhai, server ka battul gul ho gaya hai! 🔌 Jaake pehle apna net check kar. 🥱");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
